# HANDOFF.md: 15-second motion design showreel

Live status of this project. Any AI assistant: read this first, continue from **Next step**, and update this file after every milestone so another chatbot can take over at any time. Full rules: `AGENTS.md`.

## Goal
"Make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. Go all out."

## Status
**About 40% done.** Shared lib, overlays, all four transitions and the Boot + Title scenes are written and reviewed. Six scenes left, then the page and the MP4.
Last updated: 2026-10-27 by v0.

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

## Next step
1. New sandbox? Do **Sandbox setup** below first.
2. Write `remotion/scenes/kinetic-type.tsx` (export `KineticType`) and `remotion/scenes/shape.tsx` (export `Shape`), add both to `SCENE_COMPONENTS` in `remotion/showreel.tsx`, review with the contact sheet (frames 106, 112, 122, 137, 152, 166, 180, 195, 215), fix, then commit and push.

## Remaining
- [ ] Scenes in `remotion/scenes/`: kinetic-type, shape, generative, depth, montage, finale
- [ ] `components/showreel-player.tsx`, `app/page.tsx`, metadata in `app/layout.tsx`
- [ ] Review stills and fix problems
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

## Verify
- Fastest review: one contact sheet of up to 9 frames, then open the PNG and look at it: `pnpm exec remotion still remotion/index.ts ContactSheet /tmp/stills/sheet.png --props='{"frames":[15,70,130,195,255,315,360,400,430]}' --log=error`. Fix clipping, overflow and empty frames.
- Single full-size frame: `pnpm exec remotion still remotion/index.ts Showreel /tmp/stills/f070.png --frame=70 --log=error`
- Final render (in the background, with a timeout): `pnpm exec remotion render remotion/index.ts Showreel public/showreel/showreel.mp4 --codec=h264 --crf=18`
- Screenshot the page once in a browser.
