// Synthesizes the showreel soundtrack: 15 s at 120 BPM, 48 kHz stereo 16-bit WAV. Plain Node, no dependencies.
// Every hit is placed on a video frame (30 fps, 1 beat = 15 frames), so the sound stays locked to the picture.
// Frame numbers mirror SCENES in remotion/lib/theme.ts and the storyboard in HANDOFF.md.
// Output is deterministic (seeded noise), so re-running it produces the same file.
// Usage: node scripts/make-soundtrack.mjs [out]   (default: public/showreel/reel.wav)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUT = process.argv[2] ?? "public/showreel/reel.wav";
const SR = 48000;
const FPS = 30;
const FRAMES = 450;
const N = (FRAMES / FPS) * SR;
const BEAT = 15;
const BAR = 60;
const TAU = Math.PI * 2;

const at = (frame) => Math.round((frame / FPS) * SR);
const samples = (seconds) => Math.round(seconds * SR);
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

let seed = 20261027;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;

const makeBus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const drums = makeBus();
const music = makeBus(); // pumped by the kick (sidechain)
const fx = makeBus();
const send = makeBus(); // reverb send
const duck = new Float32Array(N).fill(1);

/** Renders voice(t) (t = seconds since its start) into a bus. pan: -1..1 or a function of t. */
function place(bus, start, seconds, voice, { gain = 1, pan = 0, verb = 0 } = {}) {
  const length = samples(seconds);
  for (let i = 0; i < length; i++) {
    const n = start + i;
    if (n >= N) break;
    const t = i / SR;
    const s = voice(t) * gain;
    if (n < 0) continue;
    const p = Math.max(-1, Math.min(1, typeof pan === "function" ? pan(t) : pan));
    const angle = ((p + 1) * Math.PI) / 4;
    const l = s * Math.cos(angle);
    const r = s * Math.sin(angle);
    bus.L[n] += l;
    bus.R[n] += r;
    if (verb) {
      send.L[n] += l * verb;
      send.R[n] += r * verb;
    }
  }
}

/** RBJ biquad. Call filter(x) per sample; filter.set(f, q) retunes it (for sweeps). */
function biquad(type, frequency, q = Math.SQRT1_2) {
  let b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const filter = (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
  filter.set = (f, resonance = q) => {
    const w = (TAU * Math.min(Math.max(f, 20), SR * 0.45)) / SR;
    const cos = Math.cos(w);
    const alpha = Math.sin(w) / (2 * resonance);
    const k = 1 / (1 + alpha);
    if (type === "lowpass") {
      b0 = ((1 - cos) / 2) * k;
      b1 = (1 - cos) * k;
      b2 = b0;
    } else if (type === "highpass") {
      b0 = ((1 + cos) / 2) * k;
      b1 = -(1 + cos) * k;
      b2 = b0;
    } else {
      b0 = alpha * k;
      b1 = 0;
      b2 = -alpha * k;
    }
    a1 = -2 * cos * k;
    a2 = (1 - alpha) * k;
  };
  filter.set(frequency);
  return filter;
}

/** Band-limited (PolyBLEP) sawtooth oscillator. */
function saw(frequency) {
  let phase = rand();
  const dt = frequency / SR;
  return () => {
    phase += dt;
    if (phase >= 1) phase -= 1;
    let blep = 0;
    if (phase < dt) {
      const x = phase / dt;
      blep = x + x - x * x - 1;
    } else if (phase > 1 - dt) {
      const x = (phase - 1) / dt;
      blep = x * x + x + x + 1;
    }
    return 2 * phase - 1 - blep;
  };
}

function sidechain(frame, depth = 0.7, release = 0.14) {
  const start = at(frame);
  const length = samples(0.6);
  for (let i = 0; i < length && start + i < N; i++) {
    const t = i / SR;
    const gain = 1 - depth * Math.min(1, t / 0.005) * Math.exp(-t / release);
    if (gain < duck[start + i]) duck[start + i] = gain;
  }
}

// ---------------------------------------------------------------- instruments

function kick(frame, gain = 1) {
  let phase = 0;
  place(drums, at(frame), 0.5, (t) => {
    phase += (TAU * (46 + 150 * Math.exp(-t / 0.032))) / SR;
    const body = Math.sin(phase) * Math.exp(-t / 0.28) * Math.min(1, t / 0.0015);
    const click = t < 0.005 ? noise() * (1 - t / 0.005) * 0.3 : 0;
    return Math.tanh((body + click) * 1.8);
  }, { gain });
  sidechain(frame);
}

const HAT_HZ = [205.3, 304.4, 369.6, 522.7, 540, 800]; // TR-808 cymbal oscillators

function hat(frame, { open = false, gain = 0.14, pan = 0.25 } = {}) {
  const phases = HAT_HZ.map(() => rand());
  const bandpass = biquad("bandpass", 10000, 0.9);
  const highpass = biquad("highpass", 7000, 0.8);
  const decay = open ? 0.09 : 0.02;
  place(drums, at(frame), decay * 5, (t) => {
    let metal = 0;
    for (let k = 0; k < HAT_HZ.length; k++) {
      phases[k] = (phases[k] + (HAT_HZ[k] * 1.5) / SR) % 1;
      metal += phases[k] < 0.5 ? 1 : -1;
    }
    return highpass(bandpass(metal / 6 + noise() * 0.6)) * Math.exp(-t / decay) * 2.5;
  }, { gain, pan, verb: open ? 0.15 : 0.04 });
}

function clap(frame, gain = 0.42) {
  const bandpass = biquad("bandpass", 1500, 1.1);
  const highpass = biquad("highpass", 500);
  place(drums, at(frame), 0.4, (t) => {
    let env = 0;
    for (const offset of [0, 0.009, 0.018]) {
      if (t >= offset) env = Math.max(env, Math.exp(-(t - offset) / 0.005));
    }
    if (t >= 0.026) env = Math.max(env, 0.8 * Math.exp(-(t - 0.026) / 0.09));
    return bandpass(highpass(noise())) * env * 3.2;
  }, { gain, verb: 0.4 });
}

function bass(frame, midi, length = 0.2, gain = 0.34) {
  const frequency = hz(midi);
  const osc = saw(frequency);
  const lowpass = biquad("lowpass", 800, 1.2);
  let sub = 0;
  place(music, at(frame), length + 0.03, (t) => {
    lowpass.set(140 + 1400 * Math.exp(-t / 0.045), 1.3);
    sub += (TAU * frequency) / SR;
    const env = Math.min(1, t / 0.004) * (t < length ? 1 : Math.max(0, 1 - (t - length) / 0.03));
    return (lowpass(osc()) * 0.55 + Math.sin(sub) * 0.75) * env;
  }, { gain });
}

/** Detuned saw chord, one copy per side for width. Lives on the pumped music bus. */
function pad(from, to, chord, { gain = 0.22, cutoff = 1600, release = 0.12 } = {}) {
  const length = (to - from) / FPS;
  for (const side of [-1, 1]) {
    const voices = chord.flatMap((m) => [
      saw(hz(m) * 2 ** ((side * 0.07) / 12)),
      saw(hz(m) * 2 ** ((-side * 0.12) / 12)),
    ]);
    const lp1 = biquad("lowpass", cutoff, 0.7);
    const lp2 = biquad("lowpass", cutoff, 0.7);
    place(music, at(from), length + release, (t) => {
      let s = 0;
      for (const voice of voices) s += voice();
      const env = Math.min(1, t / 0.015) * (t < length ? 1 : Math.max(0, 1 - (t - length) / release));
      return lp2(lp1(s / voices.length)) * env;
    }, { gain, pan: side * 0.7, verb: 0.25 });
  }
}

function pluck(frame, midi, { bus = music, gain = 0.06, pan = 0, decay = 0.1, bright = 3500, verb = 0.3 } = {}) {
  const a = saw(hz(midi));
  const b = saw(hz(midi) * 1.004);
  const lowpass = biquad("lowpass", bright, 1.5);
  place(bus, at(frame), decay * 6, (t) => {
    lowpass.set(250 + bright * Math.exp(-t / (decay * 0.7)), 1.5);
    return lowpass((a() + b()) / 2) * Math.exp(-t / decay) * Math.min(1, t / 0.002);
  }, { gain, pan, verb });
}

/** Bright chord hit on the un-ducked FX bus, so it survives the impact's sidechain. */
function stab(frame, chord, { gain = 0.15, decay = 0.45 } = {}) {
  chord.forEach((m, i) => pluck(frame, m, { bus: fx, gain, decay, bright: 6000, pan: (i - 1) * 0.5, verb: 0.5 }));
}

/** Band-passed noise that swells into `peak` (a cut), then rings out. */
function whoosh(peak, seconds, { from = 400, to = 6000, gain = 0.3, pan = 0, tail = 0.2, q = 1.2 } = {}) {
  const bandpass = biquad("bandpass", from, q);
  place(fx, at(peak) - samples(seconds), seconds + tail, (t) => {
    let env;
    let f;
    if (t <= seconds) {
      const x = t / seconds;
      env = x ** 2.5;
      f = from * (to / from) ** x;
    } else {
      const d = t - seconds;
      env = Math.exp(-d / (tail / 4));
      f = to * Math.exp(-d / tail);
    }
    bandpass.set(f, q);
    return bandpass(noise()) * env * 2.5;
  }, { gain, pan, verb: 0.25 });
}

/** Sub boom (pitch-dropping sine) plus a stereo noise crash. Ducks the music hard. */
function impact(frame, { gain = 0.8, crash = 0.22 } = {}) {
  let phase = 0;
  place(fx, at(frame), 1.4, (t) => {
    phase += (TAU * (33 + 75 * Math.exp(-t / 0.08))) / SR;
    return Math.tanh(Math.sin(phase) * Math.exp(-t / 0.5) * 1.5) * Math.min(1, t / 0.003);
  }, { gain });
  if (crash) {
    for (const pan of [-0.6, 0.6]) {
      const highpass = biquad("highpass", 2800, 0.7);
      place(fx, at(frame), 1.4, (t) => highpass(noise()) * Math.exp(-t / 0.4) * Math.min(1, t / 0.002), {
        gain: crash,
        pan,
        verb: 0.5,
      });
    }
  }
  sidechain(frame, 0.85, 0.3);
}

/** Falling sine chirp for the color-flash cuts. */
function zap(frame, { gain = 0.2, from = 2600, to = 140 } = {}) {
  let phase = 0;
  place(fx, at(frame), 0.2, (t) => {
    phase += (TAU * (to + (from - to) * Math.exp(-t / 0.025))) / SR;
    return Math.sin(phase) * Math.exp(-t / 0.06);
  }, { gain, verb: 0.3 });
}

function tick(frame, { freq = 3200, gain = 0.1, pan = 0, decay = 0.006, verb = 0.1 } = {}) {
  let phase = 0;
  place(fx, at(frame), decay * 8, (t) => {
    phase += (TAU * freq) / SR;
    return Math.sin(phase) * Math.exp(-t / decay);
  }, { gain, pan, verb });
}

/** Exponential pitch glide from f0 to f1 between two frames. */
function sweep(from, to, f0, f1, { gain = 0.07, pan = 0, verb = 0.2 } = {}) {
  const seconds = (to - from) / FPS;
  let phase = 0;
  place(fx, at(from), seconds + 0.03, (t) => {
    const x = Math.min(1, t / seconds);
    phase += (TAU * f0 * (f1 / f0) ** x) / SR;
    const env = Math.min(1, t / 0.01) * (t < seconds ? 1 : Math.max(0, 1 - (t - seconds) / 0.03));
    return (Math.sin(phase) + 0.35 * Math.sin(2 * phase)) * env;
  }, { gain, pan, verb });
}

// ---------------------------------------------------------------- arrangement

// A minor, one chord per bar (bar = 60 frames): Am F C G | Am F G | Am
const CHORDS = [
  [57, 60, 64], // Am
  [57, 60, 65], // F
  [55, 60, 64], // C
  [55, 59, 62], // G
  [57, 60, 64], // Am
  [57, 60, 65], // F
  [55, 59, 62], // G
  [57, 60, 64], // Am
];
const ROOTS = [33, 29, 36, 31, 33, 29, 31, 33]; // A1 F1 C2 G1 A1 F1 G1 A1
const barOf = (frame) => Math.min(7, Math.floor(frame / BAR));
const inBreak = (frame) => frame >= 375 && frame < 390; // drums drop out while the finale collapses to a dot
const END = 435; // the letterbox starts closing; the whole track tape-stops by 446

// BOOT 0–30: crop marks snap in, the Signal line draws left to right, the label types on and deletes, the line collapses.
tick(1, { freq: 5200, gain: 0.08, pan: -0.7 });
tick(1.5, { freq: 5600, gain: 0.08, pan: 0.7 });
sweep(2, 14, 220, 880, { gain: 0.06, pan: (t) => -0.8 + 1.6 * Math.min(1, t / 0.4) });
for (let k = 1; k <= 21; k++) {
  tick(4 + k / 1.7, { freq: 2200 + rand() * 1600, gain: 0.06, pan: rand() * 0.6 - 0.3, decay: 0.004 });
}
for (let f = 20; f <= 26; f++) tick(f, { freq: 4400, gain: 0.04, decay: 0.003 });
sweep(19, 29, 880, 110, { gain: 0.05 });
whoosh(30, 0.4, { from: 600, to: 5000, gain: 0.22 });

// 30: the drop. The dot pops and "v0" slams in.
impact(30, { gain: 0.9, crash: 0.24 });

// Groove: kick on every beat, off-beat hats (open on the last off-beat of each bar), off-beat bass,
// clap on the backbeat from the first scene cut, 16th ghost hats through the middle scenes.
for (let f = 30; f <= END; f += BEAT) {
  if (inBreak(f)) continue;
  kick(f);
  if (f % 30 === 15 && f >= 105) clap(f);
  if (f === END) continue;
  const off = f + BEAT / 2;
  const open = off % BAR === 52.5;
  hat(off, { open, gain: open ? 0.12 : 0.14 });
  bass(off, ROOTS[barOf(off)]);
  if (f >= 165 && f < 345) {
    hat(f + BEAT / 4, { gain: 0.045, pan: -0.35 });
    hat(f + (BEAT * 3) / 4, { gain: 0.055, pan: -0.35 });
  }
}

// Pads brighten bar by bar; silent during the break.
for (let bar = 0; bar < 8; bar++) {
  const from = Math.max(30, bar * BAR);
  const to = bar === 6 ? 375 : Math.min(FRAMES, (bar + 1) * BAR);
  pad(from, to, CHORDS[bar], { cutoff: 1100 + bar * 320 });
}
pad(390, 420, CHORDS[6], { cutoff: 3000 });

// 16th arpeggio an octave above the pad: shape, generative, depth, then the finale.
const arp = (f, gain) => {
  const step = Math.round(f / (BEAT / 4));
  const chord = CHORDS[barOf(f)];
  const notes = [chord[0], chord[1], chord[2], chord[0] + 12];
  pluck(f, notes[step % 4] + 12, { gain, pan: step % 2 ? 0.35 : -0.35 });
};
for (let f = 165; f < 345; f += BEAT / 4) arp(f, 0.055);
for (let f = 390; f < END; f += BEAT / 4) arp(f, 0.065);

// KINETIC TYPE 105–165: one rising note per word (TIMING. SPACING. EASING. RHYTHM.)
[72, 76, 79, 84].forEach((midi, i) => {
  pluck(105 + i * BEAT, midi, { bus: fx, gain: 0.11, decay: 0.22, bright: 5000, verb: 0.4 });
});

// Slat wipe into 105: eight slats land left to right, 0.75 frames apart.
whoosh(105, 0.33, { from: 700, to: 6000, gain: 0.2 });
for (let i = 0; i < 8; i++) {
  tick(99.75 + i * 0.75, { freq: 1800 + i * 120, gain: 0.07, pan: -0.8 + (i * 1.6) / 7, decay: 0.008 });
}

// Color-flash cuts.
for (const f of [165, 225, 345]) {
  whoosh(f, 0.35, { from: 500, to: 7000, gain: 0.22 });
  zap(f);
}

// GENERATIVE 225–285: lock into the ring, rose spin kick, spiral collapse into the iris.
impact(240, { gain: 0.35, crash: 0.12 });
whoosh(255, 0.25, { from: 1500, to: 7000, gain: 0.12 });
whoosh(285, 0.5, { from: 300, to: 4000, gain: 0.26 });
impact(285, { gain: 0.45, crash: 0 });

// DEPTH 285–345: the cube slams in, turns on each beat, then flies at the lens.
whoosh(300, 0.3, { from: 600, to: 5000, gain: 0.2 });
impact(300, { gain: 0.55, crash: 0.16 });
for (const f of [315, 330]) {
  whoosh(f, 0.16, { from: 2000, to: 6500, gain: 0.12, pan: (t) => -0.6 + t * 4 });
}
whoosh(345, 0.45, { from: 400, to: 8000, gain: 0.3 });

// MONTAGE 345–375: tiles ripple out from the center, flip on the downbeat, strobe, whip-pan left.
[345, 349, 353, 357].forEach((f, k) => {
  for (const side of [-1, 1]) {
    tick(f, { freq: 700 + k * 260 + (side > 0 ? 40 : 0), gain: 0.07, pan: side * k * 0.3, decay: 0.014 });
  }
});
impact(360, { gain: 0.5, crash: 0.3 });
zap(360, { from: 3200 });
[367, 369, 371, 373].forEach((f, k) => tick(f, { freq: 1200 + k * 600, gain: 0.07, decay: 0.01, pan: 0.5 - k * 0.3 }));
whoosh(375, 0.32, { from: 500, to: 9000, gain: 0.42, tail: 0.25, pan: (t) => 0.8 - 1.6 * Math.min(1, t / 0.5) });

// FINALE 375–450: break while everything collapses, the seal pops at 390, the hire pill on the last downbeat.
sweep(376, 389, 110, 880, { gain: 0.07 });
whoosh(390, 0.48, { from: 200, to: 6000, gain: 0.32, q: 0.8 });
impact(390, { gain: 1, crash: 0.34 });
stab(390, CHORDS[6].map((m) => m + 12));
for (const f of [405, 420, 435]) tick(f, { freq: 2600, gain: 0.05, decay: 0.01 });
impact(420, { gain: 0.5, crash: 0.26 });
stab(420, CHORDS[7].map((m) => m + 12));
tick(420, { freq: 1760, gain: 0.07, decay: 0.05, verb: 0.4 });

// ---------------------------------------------------------------- mix + master

/** Freeverb-style reverb: 8 damped combs + 4 allpasses per channel. */
function reverb(input, { feedback = 0.84, damp = 0.25, wet = 2.4 } = {}) {
  const scale = SR / 44100;
  const COMBS = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const ALLPASSES = [556, 441, 341, 225];
  const channel = (spread) => {
    const combs = COMBS.map((d) => ({ buffer: new Float32Array(Math.round((d + spread) * scale)), index: 0, store: 0 }));
    const allpasses = ALLPASSES.map((d) => ({ buffer: new Float32Array(Math.round((d + spread) * scale)), index: 0 }));
    return (x) => {
      let out = 0;
      for (const c of combs) {
        const y = c.buffer[c.index];
        c.store = y * (1 - damp) + c.store * damp;
        c.buffer[c.index] = x + c.store * feedback;
        c.index = (c.index + 1) % c.buffer.length;
        out += y;
      }
      for (const a of allpasses) {
        const b = a.buffer[a.index];
        a.buffer[a.index] = out + b * 0.5;
        out = b - out;
        a.index = (a.index + 1) % a.buffer.length;
      }
      return out * wet;
    };
  };
  const left = channel(0);
  const right = channel(23);
  const out = makeBus();
  for (let n = 0; n < N; n++) {
    const x = (input.L[n] + input.R[n]) * 0.015;
    out.L[n] = left(x);
    out.R[n] = right(x);
  }
  return out;
}

/** Slows the channel to a halt between two frames (varispeed read-back), silence after. */
function tapeStop(channel, from, to) {
  const start = at(from);
  const length = at(to) - start;
  const source = channel.slice(start, start + length + 2);
  let position = 0;
  for (let i = 0; start + i < N; i++) {
    if (i >= length) {
      channel[start + i] = 0;
      continue;
    }
    const x = i / length;
    const k = Math.floor(position);
    const frac = position - k;
    channel[start + i] = (source[k] * (1 - frac) + source[k + 1] * frac) * (1 - x) ** 0.35;
    position += (1 - x) ** 1.3;
  }
}

const verb = reverb(send);
const MUSIC_LEVEL = 1.6; // +4 dB: keeps bass, pad and arp from sitting 12 dB under the kick
const master = makeBus();
for (let n = 0; n < N; n++) {
  master.L[n] = drums.L[n] + music.L[n] * duck[n] * MUSIC_LEVEL + fx.L[n] + verb.L[n];
  master.R[n] = drums.R[n] + music.R[n] * duck[n] * MUSIC_LEVEL + fx.R[n] + verb.R[n];
}

const busRms = (name, bus, gain = () => 1) => {
  let sum = 0;
  for (let n = 0; n < N; n++) sum += (bus.L[n] * gain(n)) ** 2 + (bus.R[n] * gain(n)) ** 2;
  return [name, Math.sqrt(sum / (2 * N))];
};
const balance = [busRms("drums", drums), busRms("music", music, (n) => duck[n] * MUSIC_LEVEL), busRms("fx", fx), busRms("reverb", verb)];

// The letterbox closes 435–446: the whole track tape-stops with it, then the CRT line blips out.
tapeStop(master.L, END, 446);
tapeStop(master.R, END, 446);
let crtPhase = 0;
place(master, at(443), 0.12, (t) => {
  crtPhase += (TAU * (400 + 1800 * Math.exp(-t / 0.03))) / SR;
  return Math.sin(crtPhase) * Math.exp(-t / 0.03);
}, { gain: 0.06 });

// DC block (~25 Hz), gentle tanh saturation on the loudest hits, normalize to -1 dBFS, edge fades.
for (const channel of [master.L, master.R]) {
  let x1 = 0;
  let y1 = 0;
  for (let n = 0; n < N; n++) {
    const y = channel[n] - x1 + 0.99673 * y1;
    x1 = channel[n];
    y1 = y;
    channel[n] = y;
  }
}
const peakOf = () => {
  let peak = 0;
  for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(master.L[n]), Math.abs(master.R[n]));
  return peak;
};
const drive = 1.4 / peakOf();
for (const channel of [master.L, master.R]) {
  for (let n = 0; n < N; n++) channel[n] = Math.tanh(channel[n] * drive);
}
const normalize = 0.891 / peakOf();
const fadeIn = 64;
const fadeOut = samples(0.02);
for (const channel of [master.L, master.R]) {
  for (let n = 0; n < N; n++) {
    let g = normalize;
    if (n < fadeIn) g *= n / fadeIn;
    if (n > N - fadeOut) g *= (N - n) / fadeOut;
    channel[n] *= g;
  }
}

// ---------------------------------------------------------------- write WAV (16-bit PCM, TPDF dither)

const data = Buffer.alloc(N * 4);
const toInt16 = (x) => Math.round(Math.max(-1, Math.min(1, x + (rand() - rand()) / 32768)) * 32767);
for (let n = 0; n < N; n++) {
  data.writeInt16LE(toInt16(master.L[n]), n * 4);
  data.writeInt16LE(toInt16(master.R[n]), n * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.concat([header, data]));

const db = (x) => `${(20 * Math.log10(Math.max(x, 1e-9))).toFixed(1)} dB`;
const sectionRms = (from, to) => {
  let sum = 0;
  for (let n = at(from); n < at(to); n++) sum += master.L[n] ** 2 + master.R[n] ** 2;
  return Math.sqrt(sum / (2 * (at(to) - at(from))));
};
console.log(`wrote ${OUT}: ${FRAMES / FPS}s, ${SR} Hz stereo, ${(data.length / 1e6).toFixed(2)} MB`);
console.log(`pre-master bus RMS: ${balance.map(([name, rms]) => `${name} ${db(rms)}`).join(", ")}`);
console.log(`master peak ${db(peakOf())}, RMS by section:`);
for (const [name, from, to] of [
  ["boot", 0, 30], ["title", 30, 105], ["kinetic", 105, 165], ["shape", 165, 225], ["generative", 225, 285],
  ["depth", 285, 345], ["montage", 345, 375], ["break", 375, 390], ["finale", 390, 435], ["tape stop", 435, 450],
]) {
  console.log(`  ${name.padEnd(10)} ${db(sectionRms(from, to))}`);
}
