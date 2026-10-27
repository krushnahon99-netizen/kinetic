#!/usr/bin/env node
/**
 * Synthesizes the showreel soundtrack: 15 s at 120 BPM, locked to the 30 fps storyboard (1 beat = 15 frames), so every
 * hit lands on the frame where the picture hits. Plain Node, no dependencies, deterministic (seeded noise).
 * Writes a 48 kHz 16-bit stereo WAV and prints bus levels plus a per-beat loudness table.
 *
 *   node scripts/make-soundtrack.mjs [out.wav]      default: public/showreel/reel.wav
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const FPS = 30;
const FRAMES = 450;
const BEAT = 15;
const LENGTH = Math.round((FRAMES / FPS) * SR);
const TAU = Math.PI * 2;

const WET = 0.8;
const ECHO = 0.45;
const CEILING = 0.89; // −1 dBFS
const LIMIT_DB = 3; // how far the loudest peak is pushed into the limiter

const OUT = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(dirname(fileURLToPath(import.meta.url)), "../public/showreel/reel.wav");

/* ------------------------------------------------------------------------------------------------------ math */

const sec = (frame) => frame / FPS;
const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const clamp01 = (x) => clamp(x, 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const expoIn = (t) => (t <= 0 ? 0 : 2 ** (10 * (Math.min(t, 1) - 1)));
const expoOut = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * Math.max(t, 0)));
const range = (from, to, step) => Array.from({ length: Math.floor((to - from) / step + 1e-9) + 1 }, (_, i) => from + i * step);

/** Remotion's OVERSHOOT spring (stiffness 180, damping 12, mass 0.6) in closed form, so a pitch can overshoot like a shape. */
const spring = (() => {
  const w0 = Math.sqrt(180 / 0.6);
  const zeta = 12 / (2 * Math.sqrt(180 * 0.6));
  const wd = w0 * Math.sqrt(1 - zeta ** 2);
  return (t) => (t <= 0 ? 0 : 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t)));
})();

const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** mulberry32 seeded from a string, so every voice gets its own repeatable noise. */
const rng = (seed) => {
  let a = hash(String(seed));
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const noise = (seed) => {
  const next = rng(seed);
  return () => next() * 2 - 1;
};

/* ----------------------------------------------------------------------------------------------- oscillators */

const blep = (p, dt) => {
  if (p < dt) {
    const x = p / dt;
    return x + x - x * x - 1;
  }
  if (p > 1 - dt) {
    const x = (p - 1) / dt;
    return x * x + x + x + 1;
  }
  return 0;
};

const phasor = (phase = 0) => (freq) => {
  phase += freq / SR;
  phase -= Math.floor(phase);
  return phase;
};

const sine = (phase = 0) => {
  const step = phasor(phase);
  return (freq) => Math.sin(TAU * step(freq));
};

const saw = (phase = 0) => {
  const step = phasor(phase);
  return (freq) => {
    const p = step(freq);
    return 2 * p - 1 - blep(p, freq / SR);
  };
};

const square = (phase = 0) => {
  const step = phasor(phase);
  return (freq) => {
    const p = step(freq);
    const dt = freq / SR;
    return (p < 0.5 ? 1 : -1) + blep(p, dt) - blep((p + 0.5) % 1, dt);
  };
};

/** Zero-delay-feedback state-variable filter; the cutoff can move every sample. Read `.lp`, `.bp` or `.hp` after `run`. */
class Filter {
  s1 = 0;
  s2 = 0;
  lp = 0;
  bp = 0;
  hp = 0;

  run(x, cutoff, q = 0.707) {
    const g = Math.tan((Math.PI * clamp(cutoff, 10, SR * 0.45)) / SR);
    const k = 1 / q;
    const a1 = 1 / (1 + g * (g + k));
    const v1 = a1 * this.s1 + g * a1 * (x - this.s2);
    const v2 = this.s2 + g * v1;
    this.s1 = 2 * v1 - this.s1;
    this.s2 = 2 * v2 - this.s2;
    this.lp = v2;
    this.bp = k * v1;
    this.hp = x - k * v1 - v2;
    return this;
  }
}

/* --------------------------------------------------------------------------------------------------- voices */

const makeBus = () => [new Float32Array(LENGTH), new Float32Array(LENGTH)];
const BUS = {
  kick: makeBus(),
  drums: makeBus(),
  music: makeBus(),
  fx: makeBus(),
  verb: makeBus(),
  echo: makeBus(),
};
const kickTimes = [];

/** Renders a mono voice into a bus. `fn(t)` gets seconds since `start`; `pan` (−1…1) may be a function of t. */
function voice(bus, start, duration, fn, { gain = 1, pan = 0, verb = 0, echo = 0 } = {}) {
  const [left, right] = BUS[bus];
  const i0 = Math.max(0, Math.ceil(start * SR));
  const i1 = Math.min(LENGTH, Math.floor((start + duration) * SR));
  const panAt = typeof pan === "function" ? pan : null;
  let gl = 1;
  let gr = 1;
  const setPan = (p) => {
    const angle = (clamp(p, -1, 1) + 1) * (Math.PI / 4);
    gl = Math.cos(angle) * Math.SQRT2;
    gr = Math.sin(angle) * Math.SQRT2;
  };
  if (!panAt) setPan(pan);

  for (let i = i0; i < i1; i++) {
    const t = i / SR - start;
    if (panAt) setPan(panAt(t));
    const s = fn(t) * gain * Math.min(1, t / 0.0005, (duration - t) / 0.008);
    const l = s * gl;
    const r = s * gr;
    left[i] += l;
    right[i] += r;
    if (verb) {
      BUS.verb[0][i] += l * verb;
      BUS.verb[1][i] += r * verb;
    }
    if (echo) {
      BUS.echo[0][i] += l * echo;
      BUS.echo[1][i] += r * echo;
    }
  }
}

/* ----------------------------------------------------------------------------------------------- instruments */

function kick(frame, { gain = 0.9 } = {}) {
  const start = sec(frame);
  kickTimes.push(start);
  const body = sine();
  const click = noise(`kick${frame}`);
  const hp = new Filter();
  voice(
    "kick",
    start,
    0.6,
    (t) => {
      const freq = 47 + 230 * Math.exp(-t / 0.021) + 34 * Math.exp(-t / 0.11);
      const snap = hp.run(click(), 2600).hp * Math.exp(-t / 0.0025) * 0.55;
      return Math.tanh((body(freq) * Math.exp(-t / 0.18) + snap) * 1.9) * 0.82;
    },
    { gain },
  );
}

const CLAP_BURSTS = [0, 0.007, 0.014, 0.021];

function clap(frame, { gain = 0.9, pan = 0 } = {}) {
  const n = noise(`clap${frame}`);
  const band = new Filter();
  const air = new Filter();
  const body = sine();
  voice(
    "drums",
    sec(frame),
    0.5,
    (t) => {
      let env = t >= 0.021 ? 0.75 * Math.exp(-(t - 0.021) / 0.07) : 0;
      for (const at of CLAP_BURSTS) if (t >= at) env = Math.max(env, Math.exp(-(t - at) / 0.003));
      const x = n();
      const hands = band.run(x, 1400, 1.3).bp * env * 1.7;
      const sizzle = air.run(x, 5200).hp * Math.exp(-t / 0.085) * 0.32;
      const tone = body(lerp(210, 172, clamp01(t / 0.05))) * Math.exp(-t / 0.04) * 0.35;
      return hands + sizzle + tone;
    },
    { gain, pan, verb: 0.24 },
  );
}

const HAT_PARTIALS = [205.3, 304.4, 369.6, 522.7, 540, 800].map((f) => f * 2);

function hat(time, { gain = 0.32, decay = 0.03, pan = 0.2 } = {}) {
  const r = rng(`hat${time.toFixed(4)}`);
  const oscs = HAT_PARTIALS.map(() => square(r()));
  const n = noise(`hatnoise${time.toFixed(4)}`);
  const band = new Filter();
  const high = new Filter();
  voice(
    "drums",
    time,
    decay * 7 + 0.01,
    (t) => {
      let metal = 0;
      for (let k = 0; k < oscs.length; k++) metal += oscs[k](HAT_PARTIALS[k]);
      const x = metal * 0.1 + n() * 0.5;
      return high.run(band.run(x, 10000, 0.7).bp, 7000).hp * Math.exp(-t / decay);
    },
    { gain, pan },
  );
}

function crash(time, { gain = 0.14, decay = 0.9 } = {}) {
  for (const pan of [-0.55, 0.55]) {
    const n = noise(`crash${time.toFixed(4)}${pan}`);
    const high = new Filter();
    const wash = new Filter();
    voice(
      "drums",
      time,
      decay * 6,
      (t) => {
        const x = n();
        const body = high.run(x, 5000).hp + wash.run(x, 3400, 0.7).bp * 0.45;
        return body * Math.exp(-t / decay) * (1 + 1.4 * Math.exp(-t / 0.025)) * Math.min(1, t / 0.0015);
      },
      { gain, pan, verb: 0.3 },
    );
  }
}

function boom(time, { gain = 0.7, from = 150, to = 34, glide = 0.16, decay = 0.7 } = {}) {
  const sub = sine();
  const n = noise(`boom${time.toFixed(4)}`);
  const lp = new Filter();
  voice(
    "fx",
    time,
    decay * 6,
    (t) => {
      const freq = to + (from - to) * Math.exp(-t / glide);
      const thump = lp.run(n(), lerp(2200, 140, clamp01(t / 0.1)), 0.8).lp * Math.exp(-t / 0.07) * 0.8;
      return Math.tanh((sub(freq) * Math.exp(-t / decay) + thump) * 1.6) * Math.min(1, t / 0.002);
    },
    { gain, verb: 0.07 },
  );
}

function crack(time, { gain = 0.5, pan = 0 } = {}) {
  const n = noise(`crack${time.toFixed(4)}`);
  const band = new Filter();
  voice("fx", time, 0.14, (t) => band.run(n(), 3000, 0.7).bp * Math.exp(-t / 0.02), { gain, pan, verb: 0.35 });
}

/** Sub boom + crash + crack. Pair it with a kick on the same frame. */
function impact(frame, { size = 1, tail = 1 } = {}) {
  const time = sec(frame);
  boom(time, { gain: 0.7 * size, decay: (0.4 + 0.45 * size) * tail });
  crash(time, { gain: 0.15 * size, decay: 0.55 + 0.6 * size });
  crack(time, { gain: 0.55 * size });
}

/** Band-passed noise that swells into `peak` (seconds) and dies away after it; the filter rides the envelope. */
function whoosh(peak, { pre = 0.3, post = 0.2, gain = 0.9, low = 350, high = 4200, q = 1.1, pan = 0, verb = 0.18 } = {}) {
  const n = noise(`whoosh${peak.toFixed(4)}`);
  const a = new Filter();
  const b = new Filter();
  const length = pre + post;
  voice(
    "fx",
    peak - pre,
    length,
    (t) => {
      const u = t < pre ? (t / pre) ** 2.6 : Math.exp(((pre - t) / post) * 3.5);
      const cutoff = low * (high / low) ** u;
      return b.run(a.run(n(), cutoff, q).bp, cutoff, q).bp * u;
    },
    { gain, pan: typeof pan === "function" ? (t) => pan(t / length) : pan, verb },
  );
}

/** Narrow noise sweep between two frames on an expoOut curve (letters converging, a fall, a pull-back). */
function zip(fromFrame, toFrame, { startHz = 600, endHz = 6000, gain = 0.8, q = 2.4, pan = 0 } = {}) {
  const start = sec(fromFrame);
  const length = sec(toFrame) - start;
  const n = noise(`zip${fromFrame}`);
  const band = new Filter();
  voice(
    "fx",
    start,
    length + 0.04,
    (t) => {
      const u = clamp01(t / length);
      const env = Math.min(1, t / 0.008) * (1 - u) ** 1.2;
      return band.run(n(), startHz * (endHz / startHz) ** expoOut(u), q).bp * env;
    },
    { gain, pan, verb: 0.2 },
  );
}

/** Stereo noise swell that converges to the center and stops dead at `toFrame` (implosions, a collapse into a dot). */
function suck(fromFrame, toFrame, { gain = 0.9, low = 300, high = 5000 } = {}) {
  const start = sec(fromFrame);
  const length = sec(toFrame) - start;
  for (const side of [-1, 1]) {
    const n = noise(`suck${fromFrame}${side}`);
    const band = new Filter();
    voice(
      "fx",
      start,
      length,
      (t) => {
        const e = expoIn(t / length);
        return band.run(n(), low * (high / low) ** e, 1.2).bp * (0.04 + 0.96 * e);
      },
      { gain, pan: (t) => side * 0.9 * (1 - expoIn(t / length)), verb: 0.12 },
    );
  }
}

/** Pitched saw riser plus air, cut dead at `toFrame` so the hit after it lands in a gap. */
function riser(fromFrame, toFrame, { low = 200, high = 1600, gain = 0.2, air = 0.8, pan = 0 } = {}) {
  const start = sec(fromFrame);
  const length = sec(toFrame) - start;
  const tone = saw();
  const lp = new Filter();
  const n = noise(`riser${fromFrame}`);
  const hp = new Filter();
  voice(
    "fx",
    start,
    length,
    (t) => {
      const u = t / length;
      const freq = low * (high / low) ** (u ** 1.6);
      const body = lp.run(tone(freq), freq * 2.5, 1.4).lp * 0.5;
      const hiss = hp.run(n(), lerp(800, 7000, u * u)).hp * air;
      return (body + hiss) * u ** 2.2;
    },
    { gain, pan, verb: 0.25 },
  );
}

function blip(time, { from = 700, to = 1400, glide = 0.012, decay = 0.05, gain = 0.1, pan = 0, verb = 0.15 } = {}) {
  const osc = sine();
  voice("fx", time, decay * 6, (t) => osc(to + (from - to) * Math.exp(-t / glide)) * Math.exp(-t / decay), {
    gain,
    pan,
    verb,
  });
}

function tick(time, { freq = 3000, gain = 0.05, decay = 0.004, pan = 0 } = {}) {
  const osc = square();
  const hp = new Filter();
  voice("fx", time, decay * 7 + 0.002, (t) => hp.run(osc(freq), 1200).hp * Math.exp(-t / decay), { gain, pan });
}

/** One tick per character exactly when `<Typed>` reveals it: count = floor((frame − start) · perFrame). */
function typing(start, length, perFrame, { gain = 0.045, pan = 0, spread = 0, seed = "type" } = {}) {
  const r = rng(`${seed}${start}`);
  const count = (frame) => Math.min(length, Math.max(0, Math.floor((frame - start) * perFrame)));
  for (let frame = Math.ceil(start); count(frame - 1) < length; frame++) {
    for (let k = count(frame - 1); k < count(frame); k++) {
      tick(sec(frame) + (k - count(frame - 1)) * 0.011, {
        freq: 1900 + r() * 2600,
        gain: gain * (0.7 + 0.3 * r()),
        pan: pan + spread * (k / length),
        decay: 0.0025 + r() * 0.002,
      });
    }
  }
}

/** Random-glyph chatter (the HUD label scramble, log lines). */
function chatter(fromFrame, toFrame, { rate = 30, gain = 0.02, pan = -0.7, seed = "chatter" } = {}) {
  const r = rng(`${seed}${fromFrame}`);
  for (let time = sec(fromFrame); time < sec(toFrame); time += 1 / rate) {
    tick(time + r() * 0.006, {
      freq: 1600 + r() * 4200,
      gain: gain * (0.5 + 0.5 * r()),
      pan: pan + (r() - 0.5) * 0.2,
      decay: 0.002 + r() * 0.003,
    });
  }
}

function flip(time, { gain = 0.8, pan = 0 } = {}) {
  const n = noise(`flip${time.toFixed(4)}${pan}`);
  const band = new Filter();
  voice(
    "fx",
    time,
    0.09,
    (t) => band.run(n(), lerp(4500, 900, clamp01(t / 0.05)), 2).bp * Math.exp(-t / 0.02) * Math.min(1, t / 0.003),
    { gain, pan, verb: 0.12 },
  );
}

function slat(time, { gain = 0.35, pan = 0 } = {}) {
  const n = noise(`slat${time.toFixed(4)}`);
  const lp = new Filter();
  const body = sine();
  voice(
    "fx",
    time,
    0.07,
    (t) => (lp.run(n(), 2800, 0.9).lp * 0.9 + body(lerp(190, 120, clamp01(t / 0.02))) * 0.5) * Math.exp(-t / 0.009),
    { gain, pan, verb: 0.08 },
  );
}

/** Digital glitch: a square wave that hops pitch every 3.5 ms. */
function zap(time, { gain = 0.05, pan = 0, freq = 2400 } = {}) {
  const r = rng(`zap${time.toFixed(4)}`);
  const hops = Array.from({ length: 13 }, () => 0.5 + r() * 1.6);
  const osc = square();
  const hp = new Filter();
  voice(
    "fx",
    time,
    0.045,
    (t) => hp.run(osc(freq * hops[Math.min(12, Math.floor(t / 0.0035))]), 600).hp * Math.exp(-t / 0.013),
    { gain, pan },
  );
}

function flashHit(frame) {
  const time = sec(frame);
  whoosh(time, { pre: 0.17, post: 0.03, gain: 0.8, low: 900, high: 9000, q: 0.9 });
  crack(time, { gain: 0.45 });
  blip(time, { from: 3400, to: 1900, decay: 0.035, gain: 0.06 });
}

/** Low-passed noise that opens up as the iris does, over a short sub drop. */
function whoomp(frame, { gain = 0.8, frames = 12 } = {}) {
  const length = sec(frames);
  const n = noise(`whoomp${frame}`);
  const lp = new Filter();
  const sub = sine();
  voice(
    "fx",
    sec(frame),
    length * 2.5,
    (t) => {
      const u = clamp01(t / length);
      const air = lp.run(n(), 160 * (6500 / 160) ** expoOut(u), 0.9).lp;
      const body = sub(lerp(75, 42, u)) * Math.exp(-t / 0.12) * 0.7;
      return (air + body) * Math.exp(-t / (length * 0.5)) * Math.min(1, t / 0.004);
    },
    { gain, verb: 0.3 },
  );
}

const CLANG_PARTIALS = [1, 2.76, 5.4, 8.93, 13.34];

function clang(time, { gain = 0.08, base = 170, decay = 0.35, pan = 0 } = {}) {
  const r = rng(`clang${time.toFixed(4)}`);
  const oscs = CLANG_PARTIALS.map(() => sine(r()));
  voice(
    "fx",
    time,
    decay * 5,
    (t) => {
      let s = 0;
      for (let k = 0; k < oscs.length; k++) {
        s += (oscs[k](base * CLANG_PARTIALS[k]) * Math.exp((-t * (1 + k * 0.7)) / decay)) / (1 + k * 0.4);
      }
      return s * Math.min(1, t / 0.0008);
    },
    { gain, pan, verb: 0.35 },
  );
}

function powerDown(fromFrame, toFrame) {
  const start = sec(fromFrame);
  const length = sec(toFrame) - start;
  const fall = sine();
  const whine = sine();
  voice(
    "fx",
    start,
    length,
    (t) => {
      const u = t / length;
      const e = expoIn(u);
      return fall(2400 * (60 / 2400) ** e) * (1 - e) * 0.6 + whine(7600) * 0.05 * (1 - u);
    },
    { gain: 0.22, verb: 0.05 },
  );
}

/** Two-operator phase-modulation bell. */
function bell(time, note, { gain = 0.08, decay = 0.6, ratio = 3.5, index = 2, pan = 0, echo = 0.25, verb = 0.35 } = {}) {
  const carrier = phasor();
  const modulator = phasor();
  const freq = midi(note);
  voice(
    "music",
    time,
    decay * 5,
    (t) => {
      const m = Math.sin(TAU * modulator(freq * ratio)) * index * Math.exp(-t / (decay * 0.3));
      return Math.sin(TAU * carrier(freq) + m) * Math.exp(-t / decay) * Math.min(1, t / 0.0012);
    },
    { gain, pan, echo, verb },
  );
}

/** FM bloop whose pitch rides the same overshoot spring the shapes morph with. */
function boing(time, note, { gain = 0.18, drop = 12, decay = 0.32, pan = 0 } = {}) {
  const carrier = phasor();
  const modulator = phasor();
  voice(
    "music",
    time,
    decay * 5,
    (t) => {
      const freq = midi(note - drop * (1 - spring(t)));
      const m = Math.sin(TAU * modulator(freq * 2)) * 1.5 * Math.exp(-t / 0.09);
      return Math.sin(TAU * carrier(freq) + m) * Math.exp(-t / decay) * Math.min(1, t / 0.002);
    },
    { gain, pan, echo: 0.22, verb: 0.2 },
  );
}

function stab(time, notes, { gain = 0.1, decay = 0.16, bright = 5000, echo = 0.28, verb = 0.18 } = {}) {
  notes.forEach((note, k) => {
    for (const side of [-1, 1]) {
      const osc = saw(rng(`stab${time.toFixed(4)}${k}${side}`)());
      const lp = new Filter();
      const freq = midi(note + side * 0.08);
      voice(
        "music",
        time,
        decay * 6,
        (t) =>
          lp.run(osc(freq), 280 + bright * Math.exp(-t / 0.05), 1.1).lp * Math.exp(-t / decay) * Math.min(1, t / 0.002),
        { gain, pan: side * 0.45, echo, verb },
      );
    }
  });
}

/** Three detuned saws per note through a slowly breathing low-pass. `swell` ramps in on expoIn instead of an attack. */
function pad(fromFrame, toFrame, notes, { gain = 0.038, attack = 0.04, release = 0.12, cutoff = 1500, swell = false } = {}) {
  const start = sec(fromFrame);
  const length = sec(toFrame) - start;
  const cutoffAt = typeof cutoff === "function" ? cutoff : () => cutoff;
  for (const note of notes) {
    for (const spread of [-1, 0, 1]) {
      const r = rng(`pad${fromFrame}${note}${spread}`);
      const osc = saw(r());
      const lp = new Filter();
      const freq = midi(note + spread * 0.1 + (r() - 0.5) * 0.04);
      const wobble = r() * TAU;
      voice(
        "music",
        start,
        length + release * 5,
        (t) => {
          const u = clamp01(t / length);
          const env = swell ? expoIn(u) : Math.min(1, t / attack);
          const tail = t > length ? Math.exp(-(t - length) / release) : 1;
          const lfo = 1 + 0.2 * Math.sin(TAU * 0.35 * (start + t) + wobble);
          return lp.run(osc(freq), cutoffAt(u) * lfo, 0.8).lp * env * tail;
        },
        { gain, pan: spread * 0.65, verb: 0.32 },
      );
    }
  }
}

function bassNote(time, root, { gain = 0.36, length = 0.095, accent = 0.3 } = {}) {
  const a = saw();
  const b = square(0.25);
  const sub = sine();
  const lp = new Filter();
  const freq = midi(root + 12);
  voice(
    "music",
    time,
    length + 0.08,
    (t) => {
      const env = (t < length ? 1 : Math.exp(-(t - length) / 0.014)) * Math.min(1, t / 0.003);
      const cutoff = 170 + (650 + accent * 1500) * Math.exp(-t / 0.045);
      const tone = lp.run(a(freq) * 0.7 + b(freq * 1.004) * 0.3, cutoff, 1.5).lp;
      return Math.tanh((tone + sub(freq / 2) * 0.6) * 1.5) * env;
    },
    { gain },
  );
}

/** Granular cloud: short sine grains on scale notes at Poisson-random times. `rise` bends the cloud up in semitones. */
function sparkle(fromFrame, toFrame, notes, { density = 60, gain = 0.03, rise = 0, panAt, seed = "sparkle" } = {}) {
  const r = rng(`${seed}${fromFrame}`);
  const start = sec(fromFrame);
  const end = sec(toFrame);
  for (let time = start; time < end; time += -Math.log(1 - r()) / density) {
    const u = (time - start) / (end - start);
    const length = 0.035 + r() * 0.05;
    const osc = sine(r());
    const freq = midi(notes[Math.floor(r() * notes.length)] + rise * u);
    const level = gain * (0.45 + 0.55 * r());
    const pan = panAt ? panAt(u, r()) : r() * 1.8 - 0.9;
    voice("music", time, length, (t) => osc(freq) * Math.sin((Math.PI * t) / length) ** 2, {
      gain: level,
      pan,
      verb: 0.4,
      echo: 0.12,
    });
  }
}

/** Shepard–Risset tone: octave-spaced partials under a fixed bell curve, so it can climb forever like the self-similar tunnel. */
function shepard(fromFrame, toFrame, phaseAt, { gain = 0.05, semitonesPerStep = 2 } = {}) {
  const OCTAVES = 8;
  const oscs = Array.from({ length: OCTAVES }, (_, k) => sine(k / OCTAVES));
  const start = sec(fromFrame);
  const length = sec(toFrame) - start;
  voice(
    "music",
    start,
    length,
    (t) => {
      const position = (phaseAt(t * FPS) * semitonesPerStep) / 12;
      let s = 0;
      for (let k = 0; k < OCTAVES; k++) {
        const octave = (((k + position) % OCTAVES) + OCTAVES) % OCTAVES;
        s += oscs[k](40 * 2 ** octave) * Math.exp(-((octave - OCTAVES / 2) ** 2) / 2.4);
      }
      return s * Math.min(1, t / 0.25);
    },
    { gain, verb: 0.3, echo: 0.1 },
  );
}

/* ----------------------------------------------------------------------------------------------------- score */

// Bar-aligned, so chords change on each scene's first downbeat (local frame 15). Pads share E4; bass plays root + sub.
const CHORDS = [
  { from: 35, to: 120, pad: [55, 57, 60, 64], root: 33 }, // Am7
  { from: 120, to: 180, pad: [53, 57, 60, 64], root: 29 }, // Fmaj7
  { from: 180, to: 240, pad: [55, 60, 62, 64], root: 36 }, // Cadd9
  { from: 240, to: 300, pad: [55, 59, 62, 64], root: 31 }, // G6
  { from: 300, to: 360, pad: [55, 57, 60, 64], root: 33 }, // Am7
  { from: 360, to: 375, pad: [53, 57, 60, 64], root: 29 }, // Fmaj7
];
const rootAt = (frame) => CHORDS.find((chord) => frame >= chord.from && frame < chord.to).root;

/** Depth's tunnel phase (zoomPhase in remotion/scenes/depth.tsx), so the Shepard tone lurches with the tunnel. */
const zoomPhase = (frame) =>
  frame * 0.065 +
  0.7 * [15, 30, 45].reduce((sum, at) => sum + spring(sec(frame - at)), 0) +
  4.6 * expoIn((frame - 48) / 12);

// Groove: four on the floor from the first beat after the slam; claps on 2 and 4, so every scene cut lands on one.
[35, ...range(45, 360, BEAT), 390, 405, 420, 435].forEach((frame) => kick(frame, { gain: frame === 390 ? 1 : 0.9 }));
[...range(75, 345, 2 * BEAT), 405, 435].forEach((frame) => clap(frame));
range(45, 345, BEAT).forEach((frame) => hat(sec(frame + 7.5), { decay: frame % 60 === 45 ? 0.085 : 0.03 }));
[390, 405, 420].forEach((frame) => hat(sec(frame + 7.5), { gain: 0.22 }));
range(180, 330, BEAT).forEach((frame) => {
  hat(sec(frame + 3.75), { gain: 0.11, decay: 0.012, pan: -0.3 });
  hat(sec(frame + 11.25), { gain: 0.11, decay: 0.012, pan: -0.3 });
});
[120, 180].forEach((frame) => crash(sec(frame), { gain: 0.12, decay: 0.75 }));

// Rolling 16th bass that skips the kick's 16th; the last 16th of each bar jumps an octave.
range(120, 360, BEAT).forEach((frame) => {
  [3.75, 7.5, 11.25].forEach((offset, k) => {
    if (frame + offset >= 367) return;
    const octave = frame % 60 === 45 && k === 2 ? 12 : 0;
    bassNote(sec(frame + offset), rootAt(frame) + octave, { accent: k === 1 ? 1 : 0.25 });
  });
});

pad(35, 120, CHORDS[0].pad, { attack: 0.5 });
CHORDS.slice(1).forEach((chord) => pad(chord.from, chord.to, chord.pad));

// HUD: the section label scrambles in (bottom left) on every scene change.
[30, 105, 165, 225, 285, 345, 375].forEach((frame) => chatter(frame, frame + 12));

/* 0–30 BOOT: crop marks snap in, the Signal line draws edge to edge while the reel "loads", then collapses to a dot. */
tick(sec(1), { freq: 1500, gain: 0.12, pan: -0.7, decay: 0.006 });
tick(sec(1) + 0.004, { freq: 1700, gain: 0.12, pan: 0.7, decay: 0.006 });
blip(sec(1), { from: 260, to: 180, decay: 0.03, gain: 0.12 });
{
  const length = sec(12);
  const tone = sine();
  const buzz = saw();
  const band = new Filter();
  const n = noise("laser");
  voice(
    "fx",
    sec(2),
    length + 0.12,
    (t) => {
      const u = clamp01(t / length);
      const freq = 320 + 2400 * expoOut(u);
      const speed = Math.exp(-6.9 * u);
      const body = tone(freq) * 0.3 + band.run(buzz(freq / 2) * 0.6 + n() * 0.5, freq * 1.4, 3).bp * 0.7;
      return body * (0.12 + 0.88 * speed) * (t > length ? Math.exp(-(t - length) / 0.025) : 1);
    },
    { gain: 0.3, pan: (t) => lerp(-0.9, 0.9, expoOut(clamp01(t / length))), verb: 0.2, echo: 0.12 },
  );
}
typing(4, 21, 1.7, { pan: -0.85, spread: 0.65 });
chatter(7, 19, { gain: 0.015, pan: -0.6, seed: "log" });
typing(19, 21, 3, { gain: 0.03, pan: -0.2, spread: -0.65, seed: "delete" });
suck(18, 29.6, { gain: 0.8, low: 250, high: 4200 });
riser(20, 29.6, { low: 220, high: 880, gain: 0.14, air: 0.4 });

/* 30–105 TITLE: the dot pops, "v0" slams in (shake from local 5), letters rise, callouts type on, slat wipe out. */
blip(sec(30), { from: 500, to: 1250, glide: 0.01, decay: 0.06, gain: 0.12, verb: 0.3 });
whoosh(sec(35), { pre: sec(4), post: 0.05, gain: 0.9, low: 700, high: 6000 });
impact(35, { size: 1, tail: 0.65 });
[57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91].forEach((note, i) => {
  if (i === 6) return; // the space in "MOTION DESIGNER"
  bell(sec(42 + i * 1.2), note, {
    ratio: 3,
    index: 1.1,
    decay: 0.32,
    gain: 0.032,
    pan: lerp(-0.55, 0.55, i / 14),
    echo: 0.22,
  });
});
[45, 60, 75, 90].forEach((frame, k) => zap(sec(frame), { freq: 1800 + 500 * k, pan: k % 2 ? 0.4 : -0.4 }));
typing(50, 14, 3, { pan: 0.7, gain: 0.022, seed: "callout-a" });
typing(53, 25, 3, { pan: 0.7, gain: 0.016, seed: "callout-a2" });
typing(56, 17, 3, { pan: -0.7, gain: 0.022, seed: "callout-b" });
typing(59, 21, 3, { pan: -0.7, gain: 0.016, seed: "callout-b2" });
typing(60, 23, 2, { pan: -0.35, spread: 0.7, gain: 0.03, seed: "subtitle" });
riser(91, 104.6, { low: 220, high: 1760, gain: 0.16 });
whoosh(sec(105), { pre: sec(10), post: sec(4), gain: 0.85, low: 500, high: 5200 });
range(0, 7, 1).forEach((i) => {
  slat(sec(97.4 + i * 0.75), { pan: lerp(-0.8, 0.8, i / 7) });
  slat(sec(107.4 + i * 0.75), { pan: lerp(-0.8, 0.8, i / 7), gain: 0.22 });
});

/* 105–165 KINETIC TYPE: one word per beat. */
stab(sec(105), [69, 72, 76]); // TIMING.
stab(sec(120), [65, 69, 72, 76]); // SPACING.
zip(120, 131, { startHz: 700, endHz: 6500 });
stab(sec(135), [69, 72, 77]); // EASING.
zip(135, 140, { startHz: 5200, endHz: 420, gain: 0.6 });
boom(sec(137), { gain: 0.3, from: 110, to: 55, decay: 0.09 });
stab(sec(150), [72, 76, 79]); // RHYTHM.
[150, 157.5].forEach((frame, k) =>
  bell(sec(frame), [76, 79][k], { ratio: 4, index: 0.7, decay: 0.14, gain: 0.07, echo: 0.3 }),
);

/* 165–225 SHAPE: every morph pops on the beat with the overshoot spring. */
flashHit(165);
[
  [165, 60],
  [180, 64],
  [195, 67],
  [210, 72],
].forEach(([frame, note]) => boing(sec(frame), note));
sparkle(168, 222, [84, 86, 88, 91, 93], {
  density: 14,
  gain: 0.028,
  seed: "orbit",
  panAt: (u, r) => Math.sin(TAU * (u * 2 + r)) * 0.8,
});

/* 225–285 GENERATIVE: flow field → ring lock (240) → rose spin (255) → inhale and spiral collapse into the iris. */
flashHit(225);
sparkle(225, 240, [79, 81, 83, 86, 88], { density: 110, gain: 0.026, rise: 7, seed: "swarm" });
{
  const n = noise("swirl");
  const band = new Filter();
  const length = sec(15);
  voice(
    "fx",
    sec(225),
    length,
    (t) => {
      const u = clamp01(t / length);
      return band.run(n(), lerp(500, 2600, u * u), 2).bp * (0.3 + 0.7 * u * u);
    },
    { gain: 0.7, pan: (t) => Math.sin(TAU * (t + 2 * t * t)) * 0.75, verb: 0.25 },
  );
}
impact(240, { size: 0.8 });
bell(sec(240), 79, { decay: 0.9, gain: 0.09 });
bell(sec(240) + 0.012, 86, { decay: 0.8, gain: 0.06, pan: 0.3 });
{
  const r = rng("arp");
  const notes = [79, 83, 86, 88, 91, 95, 98];
  let k = 3;
  range(243.75, 266.25, 3.75).forEach((frame) => {
    k = clamp(k + (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 2)), 0, notes.length - 1);
    bell(sec(frame), notes[k], { ratio: 2, index: 1.3, decay: 0.16, gain: 0.04, pan: (r() - 0.5) * 1.2, echo: 0.35 });
  });
}
whoosh(sec(256), { pre: 0.06, post: 0.38, gain: 0.7, low: 900, high: 4800, pan: (u) => Math.sin(u * TAU * 2.5) * 0.85 });
suck(271, 284.6, { gain: 0.95, low: 250, high: 6000 });
riser(274, 284.6, { low: 196, high: 784, gain: 0.15 });
whoomp(285);

/* 285–345 DEPTH: Shepard tone on the tunnel phase, cube slam (300), turns MAKE → IT → MOVE, rush at the lens. */
shepard(285, 345, zoomPhase);
whoosh(sec(300), { pre: sec(13), post: 0.05, gain: 0.95, low: 180, high: 2800 });
impact(300, { size: 0.85 });
clang(sec(300), { base: 165, gain: 0.08 });
[
  [300, [69, 72, 76]],
  [315, [72, 76, 79]],
  [330, [76, 79, 84]],
].forEach(([frame, notes]) => stab(sec(frame), notes, { decay: 0.2 }));
[315, 330].forEach((frame) => {
  whoosh(sec(frame), { pre: 0.12, post: 0.1, gain: 0.55, low: 400, high: 3200, pan: (u) => lerp(0.7, -0.7, u) });
  clang(sec(frame), { base: frame === 315 ? 220 : 262, gain: 0.05, decay: 0.16 });
});
riser(333, 344.6, { low: 110, high: 880, gain: 0.2 });
whoosh(sec(345), { pre: 0.38, post: 0.1, gain: 1.2, low: 300, high: 7500 });

/* 345–375 MONTAGE: tiles swap every 4 frames in a ripple from the center, flip on the downbeat, strobe, whip-pan. */
flashHit(345);
zip(345, 357, { startHz: 5200, endHz: 500, gain: 0.45 });
[1, 2, 3].forEach((step) => {
  const frame = 345 + step * 4;
  flip(sec(frame));
  [-0.5, 0.5].forEach((pan) => flip(sec(frame + 1), { pan, gain: 0.7 }));
  [-0.85, 0.85].forEach((pan) => flip(sec(frame + 2), { pan, gain: 0.6 }));
});
impact(360, { size: 0.7 });
stab(sec(360), [65, 69, 72, 77], { decay: 0.24 });
range(0, 8, 1).forEach((k) => flip(sec(360) + k * 0.007, { pan: ((k % 3) - 1) * 0.75, gain: 0.5 }));
whoosh(sec(364), { pre: 0.08, post: 0.12, gain: 0.5, pan: (u) => lerp(-0.6, 0.6, u) });
[367, 369, 371, 373].forEach((frame, k) => {
  const note = [72, 74, 76, 79][k];
  stab(sec(frame), [note, note + 7], { decay: 0.045, gain: 0.09, echo: 0 });
  zap(sec(frame), { freq: 2000 + 600 * k, pan: k % 2 ? 0.5 : -0.5 });
});
riser(366, 374.6, { low: 330, high: 2640, gain: 0.18 });
whoosh(sec(375), { pre: sec(6), post: sec(7), gain: 1.4, low: 450, high: 8000, q: 0.8, pan: (u) => lerp(0.9, -0.9, u) });

/* 375–450 FINALE: implosion into a gap, the seal pops (390, the biggest hit), end card on the beats, CRT power-off. */
suck(376, 388.8, { gain: 1.2, low: 200, high: 7000 });
riser(377, 388.8, { low: 98, high: 784, gain: 0.2 });
pad(375, 388.8, [55, 59, 62, 64], { swell: true, release: 0.006, cutoff: (u) => 400 + 3200 * u * u, gain: 0.05 });
impact(390, { size: 1.3 });
stab(sec(390), [60, 64, 67, 71, 74], { decay: 0.5, gain: 0.11, bright: 6500, echo: 0.3 });
bell(sec(390), 84, { decay: 1.1, gain: 0.08 });
bell(sec(390) + 0.015, 91, { decay: 0.9, gain: 0.05, pan: 0.3 });
whoomp(390, { gain: 0.6, frames: 18 });
pad(390, 446, [48, 55, 59, 62, 64], { attack: 0.015, release: 0.06, cutoff: (u) => 900 + 2400 * u });
sparkle(394, 414, [84, 86, 88, 91, 93], {
  density: 45,
  gain: 0.028,
  seed: "ring",
  panAt: (u) => Math.sin(u * TAU * 1.5) * 0.85,
});
range(393.75, 431.25, 3.75).forEach((frame, k) =>
  tick(sec(frame), { freq: 5200, gain: 0.016, decay: 0.002, pan: k % 2 ? 0.35 : -0.35 }),
);
[405, 420, 435].forEach((frame) => clang(sec(frame), { base: 196, gain: 0.045, decay: 0.2 }));
[405, 420].forEach((frame) => bassNote(sec(frame), 36, { length: 0.3, accent: 0.6 }));
typing(405, 20, 2, { pan: -0.65, gain: 0.018, seed: "caption" });
typing(408, 26, 3, { pan: 0.65, gain: 0.018, seed: "credits" });
crash(sec(420), { gain: 0.1, decay: 0.6 });
[84, 88, 91].forEach((note, k) =>
  bell(sec(420) + k * 0.03, note, { ratio: 3.5, index: 1.6, decay: 0.55, gain: 0.07, pan: (k - 1) * 0.3 }),
);
typing(424, 8, 1.5, { pan: -0.1, spread: 0.2, gain: 0.05, seed: "url" });
whoosh(sec(442), { pre: sec(7), post: sec(4), gain: 0.7, low: 260, high: 2200 });
boom(sec(446), { gain: 0.3, from: 95, to: 42, decay: 0.08 });
powerDown(443.5, 449);
tick(sec(448.6), { freq: 1300, gain: 0.07, decay: 0.003 });

/* ---------------------------------------------------------------------------------------------------- mixing */

function freeverb([inL, inR], { room = 0.83, damp = 0.3 } = {}) {
  const scale = SR / 44100;
  const line = (n) => ({ buf: new Float32Array(Math.round(n * scale)), i: 0, store: 0 });
  const channels = [0, 23].map((spread) => ({
    combs: [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((n) => line(n + spread)),
    allpasses: [556, 441, 341, 225].map((n) => line(n + spread)),
  }));
  const out = makeBus();
  for (let s = 0; s < LENGTH; s++) {
    const input = (inL[s] + inR[s]) * 0.015;
    for (let c = 0; c < 2; c++) {
      const { combs, allpasses } = channels[c];
      let acc = 0;
      for (const comb of combs) {
        const y = comb.buf[comb.i];
        comb.store = y * (1 - damp) + comb.store * damp;
        comb.buf[comb.i] = input + comb.store * room;
        if (++comb.i === comb.buf.length) comb.i = 0;
        acc += y;
      }
      for (const ap of allpasses) {
        const b = ap.buf[ap.i];
        ap.buf[ap.i] = acc + b * 0.5;
        if (++ap.i === ap.buf.length) ap.i = 0;
        acc = b - acc;
      }
      out[c][s] = acc * 3;
    }
  }
  return out;
}

/** Dotted-eighth ping-pong delay (0.375 s at 120 BPM) with a darkened, thinned feedback path. */
function pingPong([inL, inR], { time = 0.375, feedback = 0.38 } = {}) {
  const n = Math.round(time * SR);
  const lineL = new Float32Array(n);
  const lineR = new Float32Array(n);
  const [toneL, toneR, lowL, lowR] = [new Filter(), new Filter(), new Filter(), new Filter()];
  const out = makeBus();
  for (let s = 0, i = 0; s < LENGTH; s++) {
    const dl = lineL[i];
    const dr = lineR[i];
    out[0][s] = dl;
    out[1][s] = dr;
    lineL[i] = (inL[s] + inR[s]) * 0.5 + lowL.run(toneL.run(dr, 3800).lp, 250).hp * feedback;
    lineR[i] = lowR.run(toneR.run(dl, 3800).lp, 250).hp * feedback;
    if (++i === n) i = 0;
  }
  return out;
}

/** Sidechain gain: dips by `depth` on every kick (4 ms attack) and recovers with time constant `release`. */
function duck(depth, release) {
  const gain = new Float32Array(LENGTH).fill(1);
  for (const time of kickTimes) {
    const i0 = Math.round(time * SR);
    for (let k = 0; k < release * 7 * SR && i0 + k < LENGTH; k++) {
      const dt = k / SR;
      const env = dt < 0.004 ? dt / 0.004 : Math.exp(-(dt - 0.004) / release);
      gain[i0 + k] = Math.min(gain[i0 + k], 1 - depth * env);
    }
  }
  return gain;
}

/** Look-ahead peak limiter: forward minimum + moving average, so the gain is already down when each peak arrives. */
function limit([l, r], ceiling) {
  const look = Math.round(0.002 * SR);
  const release = 1 - Math.exp(-1 / (0.06 * SR));
  const need = new Float32Array(LENGTH);
  for (let i = 0; i < LENGTH; i++) {
    const peak = Math.max(Math.abs(l[i]), Math.abs(r[i]));
    need[i] = peak > ceiling ? ceiling / peak : 1;
  }
  const held = new Float32Array(LENGTH);
  let g = 1;
  for (let i = 0; i < LENGTH; i++) {
    let m = 1;
    for (let k = 0; k < look && i + k < LENGTH; k++) m = Math.min(m, need[i + k]);
    g = Math.min(m, g + (1 - g) * release);
    held[i] = g;
  }
  let sum = 0;
  let minGain = 1;
  for (let i = 0; i < LENGTH; i++) {
    sum += held[i];
    if (i >= look) sum -= held[i - look];
    const gain = sum / Math.min(i + 1, look);
    minGain = Math.min(minGain, gain);
    l[i] = clamp(l[i] * gain, -0.999, 0.999);
    r[i] = clamp(r[i] * gain, -0.999, 0.999);
  }
  return minGain;
}

const db = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
const levels = ([l, r], i0 = 0, i1 = LENGTH) => {
  let peak = 0;
  let sum = 0;
  for (let i = i0; i < i1; i++) {
    peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]));
    sum += l[i] * l[i] + r[i] * r[i];
  }
  return { peak: db(peak), rms: db(Math.sqrt(sum / (2 * Math.max(1, i1 - i0)))) };
};
const fmt = ({ peak, rms }) => `peak ${peak.toFixed(1).padStart(6)} dB  rms ${rms.toFixed(1).padStart(6)} dB`;

const verbReturn = freeverb(BUS.verb);
const echoReturn = pingPong(BUS.echo);
const pump = duck(0.55, 0.1);
const wetPump = duck(0.35, 0.13);
const wetEnd = (i) => 1 - clamp01((i / SR - sec(440)) / (sec(449) - sec(440)));

const mix = makeBus();
for (let c = 0; c < 2; c++) {
  const rumble = new Filter();
  for (let i = 0; i < LENGTH; i++) {
    const dry = BUS.kick[c][i] + BUS.drums[c][i] + BUS.fx[c][i] + BUS.music[c][i] * pump[i];
    const wet = (verbReturn[c][i] * WET + echoReturn[c][i] * ECHO) * wetPump[i] * wetEnd(i);
    mix[c][i] = rumble.run(dry + wet, 22).hp;
  }
}

console.log("buses (pre-master)");
for (const [name, bus] of Object.entries({ ...BUS, verbReturn, echoReturn })) console.log(`  ${name.padEnd(11)} ${fmt(levels(bus))}`);

const rawPeak = 10 ** (levels(mix).peak / 20);
const drive = (CEILING / rawPeak) * 10 ** (LIMIT_DB / 20);
for (let c = 0; c < 2; c++) for (let i = 0; i < LENGTH; i++) mix[c][i] *= drive;
const minGain = limit(mix, CEILING);

const fadeOut = Math.round(0.012 * SR);
for (let c = 0; c < 2; c++) for (let k = 0; k < fadeOut; k++) mix[c][LENGTH - 1 - k] *= k / fadeOut;

console.log(`master      ${fmt(levels(mix))}  limiter max GR ${(-db(minGain)).toFixed(1)} dB`);
const perBeat = range(0, FRAMES - BEAT, BEAT).map((frame) => {
  const { rms } = levels(mix, Math.round(sec(frame) * SR), Math.round(sec(frame + BEAT) * SR));
  return `${String(frame).padStart(3)}:${rms.toFixed(0).padStart(4)}`;
});
for (let row = 0; row < perBeat.length; row += 10) console.log(`  rms/beat  ${perBeat.slice(row, row + 10).join("  ")}`);

/* ----------------------------------------------------------------------------------------------------- write */

const wav = Buffer.alloc(44 + LENGTH * 4);
wav.write("RIFF", 0, "ascii");
wav.writeUInt32LE(36 + LENGTH * 4, 4);
wav.write("WAVE", 8, "ascii");
wav.write("fmt ", 12, "ascii");
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36, "ascii");
wav.writeUInt32LE(LENGTH * 4, 40);
const dither = rng("dither");
for (let i = 0; i < LENGTH; i++) {
  for (let c = 0; c < 2; c++) {
    const value = Math.round(mix[c][i] * 32767 + (dither() - dither()));
    wav.writeInt16LE(clamp(value, -32768, 32767), 44 + i * 4 + c * 2);
  }
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, wav);
console.log(`wrote ${OUT} (${(wav.length / 1e6).toFixed(2)} MB, ${(LENGTH / SR).toFixed(3)} s, ${SR} Hz stereo)`);
