# HANDOFF.md: 15-second motion design showreel

Live status of this project. Any AI assistant: read this first, continue from **Next step**, and update this file after every milestone so another chatbot can take over at any time. Full rules: `AGENTS.md`.

## Goal
"Make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. Go all out."

## Status
**About 85% done.** The whole 450-frame video is built: all eight scenes (boot → finale), four transitions and the overlays are written and reviewed on contact sheets. Left: the web page with the player, the MP4 render, optional sound, a browser screenshot.
Last updated: 2026-10-27 by v0 (third account).

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

## Next step
1. New sandbox? Do **Sandbox setup** below first.
2. Write `components/showreel-player.tsx`, `app/page.tsx` and the metadata/viewport in `app/layout.tsx` (see **Files**), check the page in a browser, update this file, commit and push.

## Remaining
- [ ] `components/showreel-player.tsx`, `app/page.tsx`, metadata in `app/layout.tsx`
- [ ] Render `public/showreel/showreel.mp4`
- [ ] Optional: synthesized soundtrack
- [ ] Screenshot the page in a browser

## Sandbox setup (every new sandbox)
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
- `components/showreel-player.tsx` ("use client"): `<Player component={Showreel} durationInFrames={450} fps={30} compositionWidth={1920} compositionHeight={1080} controls loop autoPlay style={{ width: "100%" }} />`
- `app/page.tsx`: dark showcase page with the player, a Download MP4 link (`/showreel/showreel.mp4`) and a short list of techniques. Update metadata and viewport `themeColor` in `app/layout.tsx`.

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

### Optional sound
A Node script synthesizes a 15 s, 120 BPM WAV (kick on every beat, off-beat hats, noise whooshes at cuts, sub impact at frame 375) into `public/showreel/reel.wav`. Add it with `<Audio src={staticFile("showreel/reel.wav")} />` from `@remotion/media`.

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

## Verify
- Fastest review: one contact sheet of up to 9 frames, then open the PNG and look at it: `pnpm exec remotion still remotion/index.ts ContactSheet /tmp/stills/sheet.png --props='{"frames":[15,70,130,195,255,315,360,400,430]}' --log=error`. Fix clipping, overflow and empty frames.
- Single full-size frame: `pnpm exec remotion still remotion/index.ts Showreel /tmp/stills/f070.png --frame=70 --log=error`
- Final render (in the background, with a timeout): `pnpm exec remotion render remotion/index.ts Showreel public/showreel/showreel.mp4 --codec=h264 --crf=18`
- Screenshot the page once in a browser.
