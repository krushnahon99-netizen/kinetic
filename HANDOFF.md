# HANDOFF.md: 15-second motion design showreel

Live status of this project. Any AI assistant: read this first, continue from **Next step**, and update this file after every milestone so another chatbot can take over at any time. Full rules: `AGENTS.md`.

## Goal
"Make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. Go all out."

Follow-ups from the owner (2026-10-27), in their words:
1. "I was to download the video but it says download failed"
2. "You have to add, at first the 'Created by Krushna Hon' and animate,design, etc. At first it'll in big and then by motion graphics and effects it goes to a corner, only as Krushna Hon and stays there through whole video"

## Status
Original request: **100% done** (450-frame video, web page, soundtrack, final MP4). Follow-ups 1 and 2: **in progress, about 75%** (download fix built; credit reviewed and polished; soundtrack regenerated). Left: re-render the MP4 + OG image, browser check, push to `main`.
Last updated: 2026-10-27 by v0 (eighth account).

## Done
- [x] Stack: Remotion 4.0.539 inside the existing Next.js 16 App Router + Tailwind + pnpm app
- [x] Installed at exactly 4.0.539: `remotion`, `@remotion/player`, `@remotion/media`, `@remotion/fonts`, `@remotion/noise`, `@remotion/paths`, and dev `@remotion/cli`
- [x] `pnpm-workspace.yaml`: under `allowBuilds`, `esbuild: true`
- [x] Fonts in `public/showreel/fonts/`: `Archivo-Variable.ttf` (axes wdth 62–125, wght 100–900) and `JetBrainsMono-Variable.ttf`
- [x] `remotion/lib/theme.ts`, `remotion/lib/easing.ts`, `remotion/lib/fonts.ts`
- [x] `remotion/index.ts` + `remotion/root.tsx`
- [x] `remotion/showreel.tsx` with persistent overlays in `remotion/overlays/`: `grain.tsx`, `crop-marks.tsx`, `letterbox.tsx`, `hud.tsx`
- [x] Test still of frame 70 renders: fonts load, HUD, crop marks, grain and letterbox look right
- [x] `remotion/lib/type.tsx`: `mono(size, extra)`, `display(size, wdth, wght, extra)` style helpers and `<Typed>` (type-on that reserves full width)
- [x] `remotion/transitions/`: `flash.tsx`, `slat-wipe.tsx`, `iris.tsx`, `whip-pan.tsx`, already placed in `showreel.tsx` at the cuts 105 (slat), 165/225/345 (flash), 285 (iris), 375 (whip)
- [x] `remotion/scenes/boot.tsx` and `remotion/scenes/title.tsx`, reviewed on a contact sheet (frames 6–105 look right; slat wipe fully covers at 105)
- [x] `remotion/contact-sheet.tsx`: `ContactSheet` composition that renders up to 9 frozen frames in one still (see **Verify**)
- [x] `remotion/scenes/kinetic-type.tsx` (`KineticType`) and `remotion/scenes/shape.tsx` (`Shape`), registered in `SCENE_COMPONENTS`, reviewed on contact sheets (frames 106–215); `pnpm exec tsc --noEmit` passes
- [x] `remotion/lib/caption.tsx` (`FigCaption`, `StateList`), now used by Shape, Generative and Depth
- [x] `remotion/scenes/generative.tsx` (`Generative`) and `remotion/scenes/depth.tsx` (`Depth`), registered in `SCENE_COMPONENTS`, reviewed on contact sheets (frames 226–344, including the iris close/open and the cobalt flash cut); `tsc` passes
- [x] `remotion/scenes/montage.tsx` (`Montage`) and `remotion/scenes/finale.tsx` (`Finale`), registered in `SCENE_COMPONENTS`, reviewed on contact sheets (frames 346–437) and fixed (varied tile clips, softer whip strobe, captions aligned to the seal); `tsc` passes. Every scene has now been reviewed.
- [x] Web page: `app/page.tsx`, `components/showreel-player.tsx`, `components/showreel/*` (header, hero, spec sheet, scene index, footer), palette + fonts in `app/globals.css`, metadata/viewport in `app/layout.tsx`, security headers in `next.config.mjs`, OG image `app/opengraph-image.jpg` (still of frame 80) + `.alt.txt`. Checked in a browser at 1440×900 and 390×844: autoplay, live scene tracking and click-to-seek work; `tsc` passes.
- [x] Soundtrack: `scripts/make-soundtrack.mjs` (plain Node, no deps, deterministic) → `public/showreel/reel.wav` (15 s, 48 kHz stereo 16-bit, 2.9 MB, peak −1 dBFS). `remotion/showreel.tsx` now exports `ShowreelPicture` (picture only; the contact sheet uses it) and `Showreel` (picture + `<Audio src={staticFile("showreel/reel.wav")} />` from `@remotion/media`; the composition and the Player use it). A 46-frame test render has an AAC 48 kHz stereo track; `tsc` passes.
- [x] One-command helpers in `package.json`: `pnpm reel:setup` (runs `scripts/setup-sandbox.sh`), `pnpm reel:sound`, `pnpm reel:render`
- [x] Final render `public/showreel/showreel.mp4`: 6.7 MB, h264 1920×1080 15.000 s + AAC 48 kHz stereo 15.019 s (CRF 24, x264 `slow`). Rendered to `/tmp` with `--concurrency=3` in 93 s on a 4-CPU sandbox, then copied in. Frames 315 and 400 pulled from the MP4 look clean, and the dev server serves it (`200 video/mp4`), so both Download buttons work.
- [x] Final browser check at 1440×900: the Player autoplays muted; after clicking "Unmute sound" it keeps playing in real time (HUD TC 00:00:08:10 → 00:00:10:25 in 2.6 s) and the scene index follows (GENERATIVE → DEPTH). Header, hero, player, spec sheet, scene index and footer all lay out correctly.

## Next step
In-progress work is pushed to the branch `v0/krushna-credit-1027`, which can be ahead of `main`. A v0 import fetches only `main`, so a plain `git fetch origin` does not see that branch. Run:
```bash
git fetch origin +refs/heads/v0/krushna-credit-1027:refs/remotes/origin/v0/krushna-credit-1027 && git log --oneline main..origin/v0/krushna-credit-1027
```
If that lists commits, run `git checkout -b v0/krushna-credit-1027 origin/v0/krushna-credit-1027` and read this file again there; otherwise stay on `main`. Then do the first unticked item in **Remaining**.
Change loop:
1. New sandbox? Run `pnpm reel:setup` first (see **Sandbox setup**).
2. Edit the scene in `remotion/scenes/` (or the page in `components/showreel/`), then review it with a contact sheet (see **Verify**) and `pnpm exec tsc --noEmit`.
3. If the video changed, re-render and check it (see **Verify**). If frame 80 changed, refresh the OG image: `pnpm exec remotion still remotion/index.ts Showreel app/opengraph-image.jpg --frame=80 --scale=0.625 --image-format=jpeg --log=error`.
4. Update this file, commit and push (see **Working on this repo from v0**).

## Remaining
- [x] Synthesized soundtrack
- [x] Render `public/showreel/showreel.mp4`
- [x] Final screenshot of the page in a browser
- [x] Follow-up 1: download fix (see **Download fix**): `components/showreel/download-link.tsx` used by both buttons, `Content-Disposition` header in `next.config.mjs` (checked with `curl -I`). The browser click check is in the last item.
- [x] Follow-up 2: `remotion/overlays/credit.tsx` + boot changes (see **Creator credit**): credit overlay, `cropOffset`/`INSET` exported from `crop-marks.tsx`, boot label removed and % counter moved, Title FIG. 01 moved to `top: 190`, scene index copy in `components/showreel/chapters.ts`. Reviewed on 3 contact sheets (frames 4–46, 70, 106, 130, 360, 440) by the eighth account, which then set `SIZE` 184 → 170 (the name now sits on the 120 px margin grid) and shortened the ghost trail (fades 32–38) so it no longer smears over the "v0" slam. `tsc` passes.
- [x] Soundtrack for the credit in `scripts/make-soundtrack.mjs` (10 type ticks from 4, 10 backspace ticks from 20, fling whoosh panned right at 32, lock ticks 38/39), then `pnpm reel:sound`: peak −1.0 dB, section RMS unchanged (title −11.6, finale −10.4 dB)
- [ ] Re-render the MP4 and the OG image (frame 80) and check them; browser check of the page and the Download button
- [ ] Update the storyboard in this file and push to `main`

## Sandbox setup (every new sandbox)
`pnpm reel:setup` runs all of this (`scripts/setup-sandbox.sh`):
```bash
pnpm install
pnpm exec remotion browser ensure
# Amazon Linux 2023 sandboxes (v0) lack Chrome's system libs ("libnspr4.so: cannot open shared object file"). Fix:
sudo dnf install -y -q nss nspr atk at-spi2-atk cups-libs libdrm libxkbcommon libXcomposite libXdamage libXrandr libXfixes libXext libX11 libxcb mesa-libgbm pango cairo alsa-lib libxshmfence dbus-libs expat
```

### Working on this repo from v0
v0's file tools can only write inside `/vercel/share/v0-project`, so put the kinetic repo there instead of cloning elsewhere:
```bash
cd /vercel/share/v0-project
git remote add kinetic https://github.com/krushnahon99-netizen/kinetic.git
git fetch kinetic
git checkout -b v0/kinetic-showreel kinetic/main
git branch --unset-upstream
pnpm install
```
Save progress after every milestone: `git add -A && git commit -m "..." && git push kinetic HEAD:main`. The owner approved pushing straight to `main`. If the chat was imported from the kinetic repo directly, `origin` already is kinetic, so just push to it.
v0 chats imported from the repo: v0's SyncGit tool commits to a `v0/...` branch (it never pushes to `main`), so after each SyncGit also run `git push origin HEAD:main`. A new account's import clones `main`, so `main` must always have the latest work and this file.

## Starting from an empty scaffold
Skip this if `package.json` already lists `remotion` 4.0.539 (for example, when the repo was imported from GitHub).

```bash
pnpm add --save-exact remotion@4.0.539 @remotion/player@4.0.539 @remotion/fonts@4.0.539 @remotion/noise@4.0.539 @remotion/paths@4.0.539 @remotion/media@4.0.539
pnpm add --save-exact -D @remotion/cli@4.0.539
# In pnpm-workspace.yaml, under allowBuilds, set `esbuild: true`, then:
pnpm install
mkdir -p public/showreel/fonts
curl -fsSL -o public/showreel/fonts/Archivo-Variable.ttf "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf"
curl -fsSL -o public/showreel/fonts/JetBrainsMono-Variable.ttf "https://github.com/google/fonts/raw/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
pnpm exec remotion browser ensure
```

## Decisions

### Files
- `remotion/index.ts`: `registerRoot(RemotionRoot)`. Never import this file from the Next app.
- `remotion/root.tsx`: `<Composition id="Showreel" component={Showreel} durationInFrames={450} fps={30} width={1920} height={1080} />` (values come from `VIDEO` in `lib/theme.ts`)
- `remotion/showreel.tsx`: calls `ensureFonts()` at module level; scenes are listed in `SCENE_COMPONENTS` (`{ id, Component }`) and mapped to back-to-back `<Sequence>`s using `SCENES[id]`; then transitions (global frames via `at`), then overlays in this order: `CropMarks`, `Letterbox`, `Hud`, `Grain` (grain always on top). Scene components read the local frame from `useCurrentFrame()` (0 = scene start).
- `remotion/contact-sheet.tsx` + second composition `ContactSheet` in `root.tsx`: wraps `<Showreel>` in `<Freeze frame={n}>` per tile (2×2 for ≤4 frames, else 3×3), each tile labelled with its frame number
- `remotion/lib/theme.ts`: `COLORS`, `VIDEO`, `BEAT` (15) / `BAR` (60), `LETTERBOX` (60 px), `DISPLAY_STACK` / `MONO_STACK`, `SCENES` (from, duration and HUD label per scene), `sceneAt(frame)`, `axes(wdth, wght)` → `fontVariationSettings` string
- `remotion/lib/easing.ts`: `expoOut` / `expoIn` / `expoInOut`, `OVERSHOOT`, `CLAMP`, `tween(frame, [start, end], [from, to], easing)`, `progress(frame, start, duration, easing)`, `pop(frame, fps, delay)` (overshoot spring), `lerp`, `clamp01`, `beatPulse(frame)` (1 on each beat, decays)
- `remotion/lib/fonts.ts`: `ensureFonts()` loads both fonts with `@remotion/fonts`; returns early when `typeof window === "undefined"` (Next SSR has no FontFace)
- `remotion/overlays/`: `grain.tsx` (feTurbulence at half resolution, new seed per frame, 6.5% opacity), `crop-marks.tsx` (spring snap-in at frame 1, 5 px inward kick on each beat, `mixBlendMode: difference`), `letterbox.tsx` (60 px bars; close to black over frames 435–446, then a Signal CRT line shrinks to nothing), `hud.tsx` (type-on at boot, fades out 438–446)
- `remotion/transitions/*.tsx` and `remotion/scenes/*.tsx`: one file each (see storyboard)
- `scenes/kinetic-type.tsx`: a `WORDS` array; each word has `pose(t, fps)` → `{ x, y, skew, scale, wdth, tracking }`, an optional per-letter `letterY`, and a `Detail` widget in the bottom row (frame ruler / tracking blocks / easing curve with a moving dot / 16-bar meter). Ghosts = the same pose sampled 0.9 frames earlier ×6, drawn in the accent color. Background per beat: Bone, Signal, Ink, Cobalt. A giant outline copy of the word scrolls behind.
- `scenes/shape.tsx`: all four shapes are sampled at the same 120 angles (ray–polygon hit), so the morph is a per-point radius lerp driven by `pop()` on each beat (no `interpolatePath`, no point-matching artifacts). Echo outlines = the same path 4 and 8 frames earlier. Satellites on 3 tilted ellipses are drawn behind or in front of the shape depending on `sin(theta)`.
- `lib/caption.tsx`: every scene from Shape on has the same left caption (`FigCaption`: Signal square + typed mono lines at `left: 120, top: cy − 30`, optional live readout as children) and right state list (`StateList` at `right: 120, top: cy − 78`, active row = `floor(frame / BEAT)`). Figure numbers so far: FIG. 01–02 (title), 03 (shape), 04 (generative), 05 (depth).
- `scenes/generative.tsx`: 300 particles. A module-level cache integrates the flow field (swirl around the center + `noise3D` bend) once for 12 pre-roll frames + up to the lock; frames render out of order, so nothing accumulates between renders. Ring slots are assigned by each particle's angle at the lock (no criss-crossing). States per beat: flow → lock into a 3-band ring at local 15 (Signal shockwave) → 5-petal rose `r·(1 + 0.28·sin 5θ)` with a spin kick at 30 → inhale at 45, then a spiral collapse to a Signal core that the iris closes on. Trails = the same particle sampled 8× at 0.75-frame steps; one tail + one head `<path>` per color.
- `scenes/depth.tsx`: tunnel frame `id` has scale `1.32^(id + phase)` (self-similar, so the infinite zoom wraps seamlessly), twists 6° per step, and 4 corner rails join the frames into a spiral wireframe; phase = drift + a `pop()` lurch per beat + a rush into the cut. The cube is CSS 3D (`perspective: 1400`, `preserve-3d`, faces `rotateY(yaw) translateZ(200px)`): it slams in on local 15 (expoIn approach, spin, recoil), turns −90° per beat (MAKE → IT → MOVE), then flies at the lens. Face shading = Ink overlay `0.55·(1 − cos(yaw + rotY))`.
- `scenes/montage.tsx`: 3×3 full-bleed wall (10 px gutters) of real clips. Each tile renders a scene component inside `<Freeze frame={n}>` in a 1920×1080 box scaled to cover the tile (`INNER`). `CLIPS` (15) repeats boot/title → kinetic → shape → generative → depth, so neighbors differ; tile (row, col) at step k shows `CLIPS[(row·3 + col + 7k) mod 15]`. Local timeline: 0–12 pull-back from `ZOOM_IN` (center tile = full frame, continuing the Depth shot) with −6° → 0°; before 15 the tiles cut to the next clip every 4 frames in a ripple from the center (rotateY flip-in + Bone flash); at 15 (global 360, downbeat) every tile flips (rotateX) to a Kinetic Type word in diagonal color stripes with a Signal flash while rows slide ±1 tile; from 22 clips strobe every 2 frames while each row accelerates left (staggered) under an SVG `feGaussianBlur stdDeviation="x 0"` horizontal smear into the whip-pan. Tile chips: scene label (from `SCENES[id].label`) and source frame `F###`.
- `scenes/finale.tsx`: lockup center `LOCK_Y = 484`. 0–14 `Collapse`: the montage wall as flat Bone/Signal/Ink/Cobalt tiles shrinking and spinning, 48 inward speed lines and an imploding Signal ring all converge on a 12 px dot. 15 (global 390): the dot pops (`pop()`) into a 320 px Signal seal, Ink "v0" rises inside and stretches wdth 62→125, Bone shockwave + Signal echo, decaying shake. `Rings`: 72-tick dial with a Signal sweep hand, ring type on a `textPath` (letter-spacing computed to fill the circumference, revealed by a dash-offset mask), dashed orbit rings, +14° kicks on local beats 30/45/60. 30 (405): `FigCaption` "FIG. 07 — END CARD" left, credits list right (DIRECTION/DESIGN/MOTION v0, CODE REMOTION 4.0). 45 (420, last downbeat): `HirePill` pops (Signal fill decays to outline, dot blinks each beat) + typed "→ v0.app". From 52: 6% push-in while the letterbox closes (435–446). FIG. 06 is unused (the montage tiles carry chips instead).
- `components/showreel-player.tsx` ("use client"): `<Player component={Showreel} … autoPlay={!prefersReducedMotion} initiallyMuted controls loop clickToPlay doubleClickToFullscreen style={{ width: "100%" }} />` inside an `aspect-video` box with `CornerMarks`. The Player mounts only on the client (`useSyncExternalStore` on `prefers-reduced-motion`, server snapshot `null`). A `frameupdate` listener sets the active scene (`sceneAt`) and writes the active row's progress line straight to the DOM (no per-frame re-render). Clicking a scene row → `seekTo(SCENES[id].from)` + `play(event)`. Takes an `aside` slot (the server-rendered `ReelSpec`) so spec + scene index share one grid.
- `components/showreel/`: `site-header.tsx`, `hero.tsx` ("MOTION, MADE OF CODE."), `reel-spec.tsx` (spec `dl` + Signal "Download MP4" → `/showreel/showreel.mp4`), `chapters.ts` (per-scene technique blurbs + SMPTE `timecode()`), `chapter-list.tsx` (scene index buttons, `aria-current` on the active one), `corner-marks.tsx`, `site-footer.tsx` ("Available for hire" pill, → v0.app).
- `app/globals.css`: always dark; shadcn tokens mapped to the reel palette, plus `ink`/`bone`/`signal`/`cobalt` colors; `@font-face` for Archivo (`font-stretch: 62% 125%`) and JetBrains Mono from the same `/showreel/fonts/` files the Player loads (preloaded in `layout.tsx` with `preload()` from `react-dom`), so each font downloads once. `font-sans` = Archivo, `font-mono` = JetBrains Mono; width via `font-stretch-*` utilities.
- `app/layout.tsx`: title "v0 — Motion Design Reel 2026", description, `twitter.card = summary_large_image`, viewport `colorScheme: dark`, `themeColor: #0b0b0c`. OG image is file-based: `app/opengraph-image.jpg` (Remotion still of frame 80 at `--scale=0.625`).
- `scripts/make-soundtrack.mjs`: the soundtrack synth (see **Sound**). `scripts/setup-sandbox.sh`: `pnpm install` + `remotion browser ensure` + the `dnf` libs.

### Look
- Palette: Ink `#0B0B0C`, Bone `#F2EFE8`, Signal `#FF4D1F`, Cobalt `#2B4DFF` (sparingly).
- Type: Archivo; animate `fontVariationSettings` via `axes(wdth, wght)` for kinetic stretch. JetBrains Mono for HUD and labels.
- 120 BPM grid: 1 beat = 15 frames, 1 bar = 60 frames. Cuts and hits land on beats. Note: scenes 105/165/225/285 start on the 4th beat of a bar, so each scene's first downbeat is at local frame 15.
- Easing, no linear moves: expoOut `Easing.bezier(0.16, 1, 0.3, 1)`, expoIn `Easing.bezier(0.7, 0, 0.84, 0)`, expoInOut `Easing.bezier(0.87, 0, 0.13, 1)`. Overshoot: `spring({ frame, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } })`.
- Frame layout: 60 px Ink letterbox bars top and bottom → 1920×960 (2:1) picture area. The HUD lives inside the bars (always on Ink): top-left "v0 — MOTION REEL 2026", top-center dim "1920×1080 · 30 FPS · 120 BPM", top-right "TC" + SMPTE timecode, bottom-left section label (scrambles in from random glyphs on every scene change), bottom-center 360 px Signal progress bar, bottom-right 4-square beat ticker + blinking REC dot. Crop marks sit 40 px inside the picture corners.
- Transitions are cover cuts: a slat wipe, iris, whip-pan smear or color flash frame covers the whole frame exactly at the cut.

### Storyboard (30 fps, 450 frames)
- **0–30 BOOT**: crop marks snap in, a Signal line draws edge to edge (`evolvePath`), mono text types "LOADING REEL_2026.MOV", the line collapses to a dot.
- **30–105 TITLE**: the dot pops, giant "v0" slams in (spring overshoot + RGB-split ghosts), "MOTION DESIGNER" letters rise out of masks with wdth 62→125 breathing, mono "SELECTED WORK 2024—2026". Slat wipe out.
- **105–165 01 KINETIC TYPE**: one word per beat, "TIMING." "SPACING." "EASING." "RHYTHM.", and the background color flips every beat. Skew/stretch with trailing ghost copies (fake motion blur).
- **165–225 02 SHAPE**: circle → square → triangle → star morph (`interpolatePath`), orbiting satellites, a 16×9 dot grid rippling out from the center.
- **225–285 03 GENERATIVE**: about 300 particles in a `noise3D` flow field (SVG) converge into a ring on the downbeat. Iris wipe out.
- **285–345 04 DEPTH**: CSS 3D perspective, an infinite-zoom tunnel of nested frames plus a rotating type cube "MAKE / IT / MOVE".
- **345–375 MONTAGE**: a 3×3 tile grid flips with rapid 4-frame flashes of earlier motifs, then a whip-pan into the finale. Idea: `<Freeze frame={n}>` from `remotion` can show real frozen frames of earlier scenes inside the tiles.
- **375–450 FINALE**: everything collapses to the center. Lockup "v0" + Signal circle, "MOTION DESIGN REEL 2026", a blinking "AVAILABLE FOR HIRE" pill, "v0.app". On the last beat the letterbox closes to black (already built in `overlays/letterbox.tsx`).

### Sound (built)
`scripts/make-soundtrack.mjs` synthesizes everything sample by sample (PolyBLEP saws, RBJ biquads, Freeverb-style reverb, seeded noise) and places every hit on a video frame. A minor, one chord per bar: Am F C G | Am F G | Am. Buses: drums, music (sidechain-pumped by the kick), fx, reverb send. Master: DC block → tanh saturation → normalize to −1 dBFS.
- 0–30 boot: crop-mark ticks, a tone that pans left→right with the Signal line, one tick per typed letter (frame 4 + k/1.7), backspace ticks, a falling tone as the line collapses
- 30: the drop (sub impact + crash). Then a kick on every beat, off-beat hats (open on the last off-beat of each bar), off-beat bass, pads that brighten bar by bar; clap on the backbeat from 105; 16th ghost hats and a 16th arpeggio from 165 to 345; one rising note per Kinetic Type word (105/120/135/150)
- Cuts: slat wipe = whoosh + 8 panned slat ticks (99.75 + 0.75·i); flashes 165/225/345 = whoosh + falling zap; iris 285 = rising whoosh + sub. Generative ring lock 240, cube slam 300 and cube turns 315/330 have their own hits
- Montage: ripple ticks 345–357, impact + zap at 360, strobe ticks 367–373, whip whoosh panned right→left into 375
- Finale: break 375–390 (no drums, rising tone + swell), big impact + G stab at 390, dial ticks 405/420/435, impact + Am stab at 420 (hire pill), then the whole mix tape-stops 435–446 with the letterbox, and a CRT blip at 443
- Levels (pre-master RMS): drums −9.4, music −17.4, fx −16.9, reverb −27.8 dB; sections ≈ −12.5 dB RMS, break −21, finale −11. To rebalance, change `MUSIC_LEVEL` or the reverb `wet`, run `pnpm reel:sound`, then re-render.

### Download fix (follow-up 1, built)
- Cause (reproduced by the sixth account): the v0 preview shows the site in a sandboxed iframe without `allow-downloads`, so Chrome blocks the `<a download>` click ("download failed"). The same link on a normal top-level page downloads the identical 6,748,879-byte file, so the file and the server are fine.
- Fix: in `next.config.mjs`, add a `headers()` entry for `source: '/showreel/showreel.mp4'` with `Content-Disposition: attachment; filename="krushna-hon-showreel-2026.mp4"`. New client component `components/showreel/download-link.tsx` renders `<a href="/showreel/showreel.mp4" download="krushna-hon-showreel-2026.mp4">`. Its `onClick` does nothing at top level, but inside an iframe (`window.self !== window.top`) it calls `event.preventDefault()` and `window.open(href, "_blank", "noopener")`, so the file downloads in a real tab. Use it for both buttons (`site-header.tsx`, `reel-spec.tsx`).

### Creator credit (follow-up 2, built)
As built, where it differs from the plan below: `SIZE` = 170 (not 184), so at wdth 125 the name spans x 120 → 1800 like the boot's log lines and % counter; the name box is centered at y = 540 − SIZE/2 − 4 (451), so it sits on the boot line; the bug scale is 24/170; the lock frame runs 38–47 (`LOCK` = 38); ghosts fade over 32–38.
Keep the video at 15 s / 450 frames, so every scene timing, the soundtrack grid and the page timecodes stay valid. The credit is one new overlay, `remotion/overlays/credit.tsx` (`Credit`), drawn above every scene and transition in this order: `CropMarks`, `Credit`, `Letterbox`, `Hud`, `Grain` (under the letterbox, so the closing bars cover it at the end). The same element starts big, flies and stays, so it reads as one continuous move.
- 3–15: above the boot's Signal line (y 540), a big "KRUSHNA HON" (Archivo 184 px, wght 900) unfolds wdth 62→125. Its letters rise out of a baseline mask in a stagger that follows the line's head, with a Signal/Cobalt RGB split (screen) that decays. "CREATED BY" (mono 26, tracking 0.42em) types on above its left edge at 1.7 chars/frame from frame 4 (done at 10), with a Signal caret.
- 20–24: "CREATED BY" backspaces at 2.5 chars/frame, leaving only the name. 25–30: anticipation (wdth squeezes to about 92, the split grows).
- 30 (the drop): the Title shockwave flings the name to the top-right corner. Position: expoOut over 13 frames along an arc. Scale: 1 → 0.13 (about 24 px) over 11 frames. Placement uses an anchor that moves from the text's center (0.5, 0.5) at (960, 444) to its top-right corner (1, 0) at (1862, 118), applied with `left/top` + `translate(-ax·100%, -ay·100%) scale(s)` and `transform-origin: ax·100% ay·100%`, so no text measuring is needed. 6 Signal ghost copies sampled 0.8 frames apart and a velocity skew sell the speed.
- About 41–46: a Signal outline flashes around the name as it locks into the top-right crop-mark bracket.
- 43–446: the bug "KRUSHNA HON" stays inside the top-right crop mark (right edge 1862, top 118), with `mixBlendMode: difference` like the crop marks so it reads on every background. A tiny RGB pulse on each cut (105, 165, 225, 285, 345, 375). It fades with the HUD (438–446).
- Boot scene changes: remove the "LOADING REEL_2026.MOV" label (the credit's typed "CREATED BY" replaces it) and move the % counter below the line (`right: 120, top: cy + 40`). The line, cursor, log lines and the collapse to the dot stay.
- Check the Title's "FIG. 01" callout (`right: 120, top: 150`) against the bug, and move it down if they crowd.
- Sound: replace the 21 typing ticks with 10 (`tick(4 + k / 1.7)` for k 0–9), use backspace ticks at `20 + (k + 1) / 2.5` for k 0–9 instead of frames 20–26, and add a short riser 24–30, a whoosh panned right at 30 for the fling and a high lock tick around 41.

## Pitfalls
- Inside `remotion/`: inline styles only (the CLI renderer doesn't run Tailwind) and relative imports only (no `@/` alias).
- Drive all motion from `useCurrentFrame()`. No CSS transitions or keyframes, no `Math.random()` (use `random(seed)` from `remotion`).
- Always clamp `interpolate` (`extrapolateLeft: "clamp"`, `extrapolateRight: "clamp"`); `tween()` / `progress()` already do.
- Load fonts with `loadFont({ family, url: staticFile("showreel/fonts/…") })` from `@remotion/fonts` (done in `lib/fonts.ts`).
- Keep every `remotion` / `@remotion/*` package on the exact same version.
- Render fails with "Failed to launch the browser process … libnspr4.so" → run the `dnf install` line from **Sandbox setup**.
- CSS 3D: a face's content turns with the cube, so after `rotateY(-180deg)` the lid's text reads upside down (fixed in depth.tsx by rotating the lid label 180°).
- Montage: freeze individual scene components (`<Freeze frame={n}><Shape /></Freeze>` inside a 1920×1080 box scaled down), never `<Showreel>` itself, because Showreel contains the montage, so that would recurse forever.
- `<Freeze frame={n}>` inside a `<Sequence>` gives its children `useCurrentFrame() === n` (4.0.539 resets `cumulatedFrom`), so a scene can be frozen at its own local frames from anywhere.
- SVG `id`s (filters, masks, textPaths) must be unique per instance, because the contact sheet renders up to 9 Showreels in one document. Build them from `useId()` with non-alphanumerics stripped (see montage.tsx / finale.tsx).
- Player autoplay (4.0.539): an **unmuted** Player waits for its Web Audio `AudioContext` to resume before advancing, and browsers block that without a user gesture, so `autoPlay` (or `player.play()` from a mount effect) shows "Pause" but stays on frame 0. Always pair `autoPlay` with `initiallyMuted`; never call `play()` without a click event.
- The background output of `remotion still` / `render` may stay empty until the process exits; check the output file (`ls`) instead of waiting on the task log. A full render takes about 1.5 min on a 4-CPU sandbox (93 s with `--concurrency=3`), so a 10 min timeout is plenty.
- MP4 size: the per-frame grain barely compresses at low CRF (CRF 18 was estimated at ≈ 42 MB for 15 s), so the render uses `--crf=24 --x264-preset=slow`, which gives 6.7 MB. When rendering by hand, render to `/tmp/showreel.mp4` and copy it into `public/showreel/` afterwards, so a half-written file can't be committed.
- `pnpm exec remotion ffmpeg` is a minimal build: filters such as `select` and `tile` fail with "No option name near …". To look at a frame of the MP4, seek instead: `pnpm exec remotion ffmpeg -v error -y -ss 10.5 -i public/showreel/showreel.mp4 -frames:v 1 -update 1 /tmp/stills/mp4-f315.png`.
- v0 sandbox Bash output sometimes drops lines (even a trailing `echo`). Redirect long output to a log file and Read that file. When re-running, use a new log file name: Read can return the earlier content of a file it already read.
- Don't open earlier v0 chats with the default `v0_messages_list` (20 messages): the result is huge and stalled the fifth account's run. Everything needed is in this file. If the owner asks you to read a chat, pass `limit: 2` (newest first; the returned `cursor` pages to older messages).
- The v0 preview iframe blocks downloads (no `allow-downloads`). Test downloads at top level (agent-browser on `http://localhost:3000`) and keep the iframe fallback in `download-link.tsx`.
- A v0 import is a single-branch clone (`remote.origin.fetch` = `main` only), so `git fetch origin` and `git checkout <branch>` cannot see other branches. List them with `git ls-remote --heads origin` and fetch one with `git fetch origin +refs/heads/<branch>:refs/remotes/origin/<branch>`.
- The remote has stale branches from earlier accounts (`v0/kinetic-showreel`, `v0/kinetic-showreel-7b86`, `v0/kinetic-showreel-858a`, `v0/kinetic-soundtrack`, …); `main` has everything. SyncGit reuses an existing branch with the same name, so give it a new one (e.g. `v0/<topic>-<date>`) to start from `main`'s HEAD.

## Verify
- Fastest review: one contact sheet of up to 9 frames, then open the PNG and look at it: `pnpm exec remotion still remotion/index.ts ContactSheet /tmp/stills/sheet.png --props='{"frames":[15,70,130,195,255,315,360,400,430]}' --log=error`. Fix clipping, overflow and empty frames.
- Single full-size frame: `pnpm exec remotion still remotion/index.ts Showreel /tmp/stills/f070.png --frame=70 --log=error`
- Final render (in the background, ≈ 1.5 min): `pnpm exec remotion render remotion/index.ts Showreel /tmp/showreel.mp4 --codec=h264 --crf=24 --x264-preset=slow --concurrency=3`, then `cp /tmp/showreel.mp4 public/showreel/showreel.mp4`. (`pnpm reel:render` uses the same codec settings at the default concurrency and writes straight into `public/showreel/`.)
- Audio track present: `pnpm exec remotion ffprobe -v error -show_entries stream=codec_type,codec_name,duration -of compact public/showreel/showreel.mp4` → one `video` (h264) and one `audio` (aac) stream, both ≈ 15 s
- Encoded frames look right: pull one or two frames from the MP4 by seeking (command in **Pitfalls**) and open the PNGs.
- Download link: `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/showreel/showreel.mp4` → `200 video/mp4`
- Screenshot the page once in a browser (unmute the Player: frames must keep advancing).
