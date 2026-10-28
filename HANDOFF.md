# HANDOFF.md: 15-second motion design showreel

Live status of this project. Any AI assistant: read this first, continue from **Next step**, and update this file after every milestone so another chatbot can take over at any time. Full rules: `AGENTS.md`.
Short on credits? Everything above **Sandbox setup** (Goal → Remaining) tells you what to do next. The sections below it are reference: Read or Grep only the one your task needs.

## Goal
"Make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. Go all out."

Follow-ups from the owner (2026-10-27), in their words:
1. "I was to download the video but it says download failed"
2. "You have to add, at first the 'Created by Krushna Hon' and animate,design, etc. At first it'll in big and then by motion graphics and effects it goes to a corner, only as Krushna Hon and stays there through whole video"
3. Follow-up 3 (2026-10-28), the owner's answers to the open question about the remaining "v0" credits. Credits: "Yes, monogram KH" (giant title letters, cube face and finale seal show "KH"; HUD, credits list, header and page title say "Krushna Hon"; same layout and timing, so the soundtrack stays as it is). The "→ v0.app" line on the end card and in the site footer: "My GitHub profile" (github.com/krushnahon99-netizen).
4. Follow-up 4 (2026-10-28, v0 chat `CeQNbrH16Q1`): a text-mask ending, where an animation plays inside giant "KH" letters. The owner sent a reference short (footage inside letters) and said: "Don't do of nature! I was only saying to give reference to you, just we'll use that method, and your KH idea is good, we'll add it but like any cool animation in that [...] what'll choose the inner animation of? But instead of directly inside video, we'll try it separately for demo and if confirmed then adding it! Give your ideas". Proposed fills: 1 = the reel's own clips, 2 = rising orange liquid with a % counter, 3 = sliding motion-principle words, 4 = an orange/blue particle river (nature, galaxy, fire and neon city were ruled out because their colors clash with the reel). The owner chose: "Ok, let's create 1+2". Build it as a **separate demo page** with a switcher (Reel clips / Orange liquid / 1 + 2) that plays the real ending music. Don't change the main video, homepage or MP4 until the owner approves one fill.

## Status
Original request and follow-ups 1, 2 and 3: **100% done** and in `main` (450-frame video with the "Created by Krushna Hon" credit and no "v0" credits left, web page, soundtrack, final MP4, working Download buttons).
Follow-up 4 (KH fill demo): **5%**. The plan is recorded here (**KH fill demo** under **Decisions**). The code goes on branch `v0/kh-fill-demo-1028`, which is not merged into `main` until the owner approves a fill.
Last updated: 2026-10-28 by v0 (eleventh account): read chats `qPs5HxsYd8S` (the tenth account, whose credits ran out while reading `CeQNbrH16Q1`) and `CeQNbrH16Q1` (an earlier account that planned the demo but wrote no code before its credits ran out), checked the remote branches (unchanged), recorded follow-up 4 here and pushed this file to `main`.

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
Follow-up 4: build the KH fill demo, starting at the first unticked item under **Remaining**. The work lives on branch `v0/kh-fill-demo-1028`, whose copy of this file has the live progress. Continue there:
```bash
git fetch origin +refs/heads/v0/kh-fill-demo-1028:refs/remotes/origin/v0/kh-fill-demo-1028 && git checkout -b v0/kh-fill-demo-1028 origin/v0/kh-fill-demo-1028
```
Then read this file again on that branch and call SyncGit with no arguments so v0 follows it. If the branch doesn't exist on the remote yet, create it from `main` with SyncGit (`branchName: v0/kh-fill-demo-1028`). Push demo commits to that branch only, never to `main` (the owner wants `main`'s video and site unchanged until a fill is approved).
Before starting other new work, confirm `main` is the newest state. A v0 import fetches only `main`, so a plain `git fetch origin` does not see other branches. Run `git ls-remote --heads origin` and compare it with the branch list in **Pitfalls**. Only a branch that is new or has moved needs a look:
```bash
git fetch origin +refs/heads/<branch>:refs/remotes/origin/<branch> && git log --oneline main..origin/<branch>
```
If that lists real work, run `git checkout -b <branch> origin/<branch>` and read this file again there; otherwise stay on `main`. For new work: add the request under **Goal** and its steps under **Remaining**, start a fresh branch with SyncGit (`branchName: v0/<topic>-<date>`), and follow the change loop below.
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
- [x] Re-render the MP4 and the OG image (frame 80) and check them; browser check of the page and the Download button. `public/showreel/showreel.mp4`: 6,814,615 bytes, h264 1920×1080 15.000 s + AAC 15.019 s; MP4 frames 18 and 45 and `app/opengraph-image.jpg` look right; the dev server sends it as `attachment; filename="krushna-hon-showreel-2026.mp4"`. Browser: at top level, clicking "DOWNLOAD MP4" saves the file (`agent-browser download`). Inside an iframe with v0's sandbox flags (no `allow-downloads`), the click opens a new top-level tab that receives the attachment (see **Verify**).
- [x] Update the storyboard in this file and push to `main` (fast-forward from `v0/krushna-credit-1027`)
- [x] Follow-up 3 (approved, see **Goal** item 3) on branch `v0/kh-credits-1028`, now in `main`: replace the remaining "v0" credits. Keep every timing, so the soundtrack stays as it is. These are not visible credits, so leave them: `generator: 'v0.app'` in `app/layout.tsx` and the iframe comment in `download-link.tsx`.
  - [x] Video edits (tenth account). "KH": `title.tsx` (`MONOGRAM` = "KH" at `MONOGRAM_SIZE` 480, which replaced `V0_SIZE` 560: at 560 the wider "KH" ran into the FIG. 01 callout), the `depth.tsx` cube face (220 px, wdth 100), the finale seal (type 156 → 140 px, because "KH" is wider than "v0"). "KRUSHNA HON": the HUD ("KRUSHNA HON — MOTION REEL 2026", typed at 3 chars/frame so it still finishes at about frame 12) and the finale `CREDITS`. Finale link "→ github.com/krushnahon99-netizen": `start={HIRE + 2}`, `perFrame={5}`, so it is complete at global ≈ 429. The soundtrack has no ticks for these, so no timing moved.
  - [x] Page edits: header "Krushna Hon — Motion reel 2026" (the " — Motion reel 2026" part is `hidden sm:inline`, so the header fits at 390 px); footer link `https://github.com/krushnahon99-netizen` (new tab, `rel="noopener noreferrer"`, lowercase, sr-only "(opens in a new tab)", aria-hidden arrow); player description; `layout.tsx` title "Krushna Hon — Motion Design Reel 2026" + description "…showreel by Krushna Hon…"; `opengraph-image.alt.txt`. `pnpm exec tsc --noEmit` passes.
  - [x] Reviewed: contact sheet `[40,80,299,395,408,418,424,430,437]`, full frames 80 and 430, then (after the 560 → 480 title fix) a 2×2 sheet `[45,80,90,104]`. Results: "KH" clears the FIG. 01 callout; the seal type (140 px) has about 30 px of air inside the 320 px circle; the "KH" cube face fits (it faces the camera only at frame 299, mid-spin); the credits column still fits (its widest entry is "REMOTION 4.0"); the link is complete by 430, before the letterbox closes. `tsc` passes.
  - [x] Re-rendered `public/showreel/showreel.mp4`: 6,612,058 bytes, h264 1920×1080 15.000 s + AAC 15.019 s, 70 s with `--concurrency=3`. MP4 frames at 9.97 s and 14.33 s look clean, and the dev server sends `200 video/mp4` with `attachment; filename="krushna-hon-showreel-2026.mp4"`. `app/opengraph-image.jpg` was refreshed from frame 80 and shows "KH".
  - [x] Browser check at 432×632 and 1440×900: the title is "Krushna Hon — Motion Design Reel 2026", the header shows "KRUSHNA HON" on mobile and "KRUSHNA HON — MOTION REEL 2026" from `sm` up, the Player renders the "KH" seal and the KRUSHNA HON HUD, the footer link wraps cleanly at 432 px, and there are no page errors. Storyboard and decisions in this file updated; pushed to `main`.
- [ ] Follow-up 4: the KH fill demo (see **KH fill demo**), on branch `v0/kh-fill-demo-1028`
  - [ ] `remotion/scenes/kh-fill.tsx`: `KhFill` (prop `mode: "clips" | "liquid" | "both"`), drawn over global frames 360–390
  - [ ] `remotion/showreel.tsx`: an optional `fill` prop on `ShowreelPicture`. Without the prop it renders exactly the current video.
  - [ ] `remotion/kh-demo.tsx` (`KhDemo`, the reel's frames 330–450 with the audio trimmed to match) + composition `KhDemo` (120 frames) in `root.tsx`; `ContactSheet` passes an optional `fill` through
  - [ ] Review contact sheets of all three modes; `pnpm exec tsc --noEmit`
  - [ ] Page `/kh-demo`: `app/kh-demo/page.tsx` + `components/kh-demo/` (Player + mode switcher, autoplay muted, loop). Not linked from the homepage.
  - [ ] Browser check of `/kh-demo`, push the branch, update this file
  - [ ] Only after the owner approves a mode: pass it to `ShowreelPicture` in the main `Showreel`, re-render the MP4 + OG image, update the storyboard, merge into `main`

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
- `scenes/finale.tsx`: lockup center `LOCK_Y = 484`. 0–14 `Collapse`: the montage wall as flat Bone/Signal/Ink/Cobalt tiles shrinking and spinning, 48 inward speed lines and an imploding Signal ring all converge on a 12 px dot. 15 (global 390): the dot pops (`pop()`) into a 320 px Signal seal, Ink "KH" (140 px) rises inside and stretches wdth 62→125, Bone shockwave + Signal echo, decaying shake. `Rings`: 72-tick dial with a Signal sweep hand, ring type on a `textPath` (letter-spacing computed to fill the circumference, revealed by a dash-offset mask), dashed orbit rings, +14° kicks on local beats 30/45/60. 30 (405): `FigCaption` "FIG. 07 — END CARD" left, credits list right (DIRECTION/DESIGN/MOTION KRUSHNA HON, CODE REMOTION 4.0). 45 (420, last downbeat): `HirePill` pops (Signal fill decays to outline, dot blinks each beat) + typed "→ github.com/krushnahon99-netizen" (5 chars/frame from local 47, complete at ≈ 429 global). From 52: 6% push-in while the letterbox closes (435–446). FIG. 06 is unused (the montage tiles carry chips instead).
- `components/showreel-player.tsx` ("use client"): `<Player component={Showreel} … autoPlay={!prefersReducedMotion} initiallyMuted controls loop clickToPlay doubleClickToFullscreen style={{ width: "100%" }} />` inside an `aspect-video` box with `CornerMarks`. The Player mounts only on the client (`useSyncExternalStore` on `prefers-reduced-motion`, server snapshot `null`). A `frameupdate` listener sets the active scene (`sceneAt`) and writes the active row's progress line straight to the DOM (no per-frame re-render). Clicking a scene row → `seekTo(SCENES[id].from)` + `play(event)`. Takes an `aside` slot (the server-rendered `ReelSpec`) so spec + scene index share one grid.
- `components/showreel/`: `site-header.tsx`, `hero.tsx` ("MOTION, MADE OF CODE."), `reel-spec.tsx` (spec `dl` + Signal "Download MP4" → `/showreel/showreel.mp4`), `chapters.ts` (per-scene technique blurbs + SMPTE `timecode()`), `chapter-list.tsx` (scene index buttons, `aria-current` on the active one), `corner-marks.tsx`, `site-footer.tsx` ("Available for hire" pill, lowercase "→ github.com/krushnahon99-netizen" link that opens in a new tab). `site-header.tsx` reads "Krushna Hon — Motion reel 2026" (the second half is hidden below `sm`).
- `app/globals.css`: always dark; shadcn tokens mapped to the reel palette, plus `ink`/`bone`/`signal`/`cobalt` colors; `@font-face` for Archivo (`font-stretch: 62% 125%`) and JetBrains Mono from the same `/showreel/fonts/` files the Player loads (preloaded in `layout.tsx` with `preload()` from `react-dom`), so each font downloads once. `font-sans` = Archivo, `font-mono` = JetBrains Mono; width via `font-stretch-*` utilities.
- `app/layout.tsx`: title "Krushna Hon — Motion Design Reel 2026", description, `twitter.card = summary_large_image`, viewport `colorScheme: dark`, `themeColor: #0b0b0c`. OG image is file-based: `app/opengraph-image.jpg` (Remotion still of frame 80 at `--scale=0.625`).
- `scripts/make-soundtrack.mjs`: the soundtrack synth (see **Sound**). `scripts/setup-sandbox.sh`: `pnpm install` + `remotion browser ensure` + the `dnf` libs.

### Look
- Palette: Ink `#0B0B0C`, Bone `#F2EFE8`, Signal `#FF4D1F`, Cobalt `#2B4DFF` (sparingly).
- Type: Archivo; animate `fontVariationSettings` via `axes(wdth, wght)` for kinetic stretch. JetBrains Mono for HUD and labels.
- 120 BPM grid: 1 beat = 15 frames, 1 bar = 60 frames. Cuts and hits land on beats. Note: scenes 105/165/225/285 start on the 4th beat of a bar, so each scene's first downbeat is at local frame 15.
- Easing, no linear moves: expoOut `Easing.bezier(0.16, 1, 0.3, 1)`, expoIn `Easing.bezier(0.7, 0, 0.84, 0)`, expoInOut `Easing.bezier(0.87, 0, 0.13, 1)`. Overshoot: `spring({ frame, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } })`.
- Frame layout: 60 px Ink letterbox bars top and bottom → 1920×960 (2:1) picture area. The HUD lives inside the bars (always on Ink): top-left "KRUSHNA HON — MOTION REEL 2026", top-center dim "1920×1080 · 30 FPS · 120 BPM", top-right "TC" + SMPTE timecode, bottom-left section label (scrambles in from random glyphs on every scene change), bottom-center 360 px Signal progress bar, bottom-right 4-square beat ticker + blinking REC dot. Crop marks sit 40 px inside the picture corners.
- Transitions are cover cuts: a slat wipe, iris, whip-pan smear or color flash frame covers the whole frame exactly at the cut.

### Storyboard (30 fps, 450 frames)
- **0–30 BOOT**: crop marks snap in, a Signal line draws edge to edge (`evolvePath`). Above it, the creator credit (`overlays/credit.tsx`): "KRUSHNA HON" (Archivo 170 px, wght 900) rises letter by letter out of the line while unfolding wdth 62→125, with a decaying Signal/Cobalt RGB split; mono "CREATED BY" types on (4–10) and backspaces (20–24); log lines and a % counter sit below the line on the same 120 px margins. 25–30: the name squeezes (anticipation) while the line collapses to a dot.
- **30–105 TITLE**: the dot pops and the giant "KH" monogram (480 px) slams in (spring overshoot + RGB-split ghosts). The same shockwave flings the name along an arc into the top-right crop mark (Signal ghost trail + velocity skew), where a Signal lock frame contracts onto it (38–47). "MOTION DESIGNER" letters rise out of masks with wdth 62→125 breathing, mono "SELECTED WORK 2024—2026". Slat wipe out.
- **38–446 CREDIT BUG**: "KRUSHNA HON" (24 px) stays inside the top-right crop mark over every scene (`mixBlendMode: difference`, so it turns teal on Signal and stays readable on Bone, Ink and Cobalt), with a small RGB pulse on each cut. It fades with the HUD (438–446) under the closing letterbox.
- **105–165 01 KINETIC TYPE**: one word per beat, "TIMING." "SPACING." "EASING." "RHYTHM.", and the background color flips every beat. Skew/stretch with trailing ghost copies (fake motion blur).
- **165–225 02 SHAPE**: circle → square → triangle → star morph (`interpolatePath`), orbiting satellites, a 16×9 dot grid rippling out from the center.
- **225–285 03 GENERATIVE**: about 300 particles in a `noise3D` flow field (SVG) converge into a ring on the downbeat. Iris wipe out.
- **285–345 04 DEPTH**: CSS 3D perspective, an infinite-zoom tunnel of nested frames plus a rotating type cube "MAKE / IT / MOVE" (its fourth, Cobalt face "KH" shows only mid-spin, around frame 299).
- **345–375 MONTAGE**: a 3×3 tile grid flips with rapid 4-frame flashes of earlier motifs, then a whip-pan into the finale. Idea: `<Freeze frame={n}>` from `remotion` can show real frozen frames of earlier scenes inside the tiles.
- **375–450 FINALE**: everything collapses to the center. Lockup "KH" + Signal circle, "MOTION DESIGN REEL 2026", credits "KRUSHNA HON", a blinking "AVAILABLE FOR HIRE" pill, "→ github.com/krushnahon99-netizen". On the last beat the letterbox closes to black (already built in `overlays/letterbox.tsx`).

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

### KH fill demo (follow-up 4, plan)
The demo replaces only global 360–390 (the montage's second half, the whip-pan at 375 and the finale's collapse) and hands off to the existing finale seal pop at 390, so the soundtrack stays unchanged and every hit already lines up. Mode "both" (1 + 2):
- 330–360: the reel as it is (Depth, the Cobalt flash at 345, the montage ripple).
- 360 (12.0 s, impact + zap): a Signal flash cuts to giant "KH" (Archivo wdth 125, wght 900, centered) with a wall of real reel clips inside (frozen scene frames, like `montage.tsx`). The camera pulls back 2.4 → 1 (expoOut, 12 frames, −6° → 0°); the clips pull back less (parallax).
- 367–373 (strobe ticks): the clips cut every 2 frames.
- 375 (whip whoosh): a sideways push of the letters. Orange (Signal) liquid rises from the baseline during the rising tone (375–390): its surface tilts and sloshes from the push, with bubbles, and a mono % readout rides the surface. The letters are full at 386.
- 384–389: "KH" shrinks (expoIn) into a dot at the seal center (960, `LOCK_Y` 484), which is exactly where the finale's seal pops from.
- 390 (13.0 s, big impact): the existing finale (seal "KH", rings, credits, hire pill, link, letterbox close).
- Mode "clips": no liquid; the clips keep strobing, then flood Signal (382–386) so the dot is orange. Mode "liquid": no clips; Bone outlines, and the liquid rises 362–386.
- Masking technique: an isolated group of content (clips and liquid), then white "KH" on black with `mix-blend-mode: multiply` (outside the letters turns black), then a full Ink layer with `mix-blend-mode: lighten` (black turns exactly Ink). This is plain CSS, so it works in both the Player and the renderer with the document's fonts.
- Archivo metrics (units per em 1000): ascender 878, descender −210, cap height 686. With `lineHeight: 1`, the caps sit centered in the line box (about 0.009 em high), the baseline is at +0.334 em and the cap top at −0.352 em from the box center.

## Pitfalls
- Record every owner request and choice in this file the moment it's made, including brainstorm picks, and push it to `main`. The follow-up 4 plan once lived only in chat `CeQNbrH16Q1`, and two accounts ran out of credits digging it back up. When the owner says "don't save", that means don't change `main`'s video or site; a docs-only update of this file is still needed.
- Replies that a v0 assistant returned through its Done tool can't be read back later: `v0_messages_list` / `v0_messages_get` return `content: ""` for them, and only the (often clipped) thinking survives.
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
- Remote branches as checked on 2026-10-28 (eleventh account, unchanged since the tenth): `main` has everything except follow-up 4. Active: `v0/kh-fill-demo-1028` (follow-up 4 demo, eleventh account; don't merge until the owner approves a fill). Already in `main`: `v0/krushna-credit-1027` (eighth account), `v0/handoff-1028` (ninth) and `v0/kh-credits-1028` (tenth). Stale, never merge: `v0/kinetic-showreel` (`0b80c3e`), `v0/kinetic-showreel-7b86` (`75b6d73`), `v0/kinetic-showreel-858a` (`a2e4938`), `v0/kinetic-soundtrack` (`fae9d79`), `v0/kinetic-final-render` (`5f1c7ba`: only adds the temporary `public/__frame-test.html` from the iframe download test), `v0/project-setup-and-implementation-4053cdc1` (`7a7851f`: an early draft of `scripts/make-soundtrack.mjs`; `main` has the final one). SyncGit reuses an existing branch with the same name, so give it a new one (e.g. `v0/<topic>-<date>`) to start from `main`'s HEAD.
- v0's memory (`v0_memories/`) belongs to one account and does not carry over when the owner switches accounts. Keep all project knowledge in this file and on `main`.

## Verify
- Fastest review: one contact sheet of up to 9 frames, then open the PNG and look at it: `pnpm exec remotion still remotion/index.ts ContactSheet /tmp/stills/sheet.png --props='{"frames":[15,70,130,195,255,315,360,400,430]}' --log=error`. Fix clipping, overflow and empty frames.
- Single full-size frame: `pnpm exec remotion still remotion/index.ts Showreel /tmp/stills/f070.png --frame=70 --log=error`
- Final render (in the background, ≈ 1.5 min): `pnpm exec remotion render remotion/index.ts Showreel /tmp/showreel.mp4 --codec=h264 --crf=24 --x264-preset=slow --concurrency=3`, then `cp /tmp/showreel.mp4 public/showreel/showreel.mp4`. (`pnpm reel:render` uses the same codec settings at the default concurrency and writes straight into `public/showreel/`.)
- Audio track present: `pnpm exec remotion ffprobe -v error -show_entries stream=codec_type,codec_name,duration -of compact public/showreel/showreel.mp4` → one `video` (h264) and one `audio` (aac) stream, both ≈ 15 s
- Encoded frames look right: pull one or two frames from the MP4 by seeking (command in **Pitfalls**) and open the PNGs.
- Download link: `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/showreel/showreel.mp4` → `200 video/mp4`
- Screenshot the page once in a browser (unmute the Player: frames must keep advancing).
- Download button, top level: `agent-browser open http://localhost:3000`, `agent-browser snapshot -i`, then `agent-browser download @<DOWNLOAD MP4 ref> /tmp/agent-browser/reel.mp4` → "Download saved". (`wait --text "Download MP4"` times out: the label is CSS-uppercased, so wait on nothing and use `snapshot`.)
- Download button inside a v0-style iframe: write a temporary `public/__frame-test.html` containing `<iframe src="/" sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox">`, `agent-browser open http://localhost:3000/__frame-test.html`, `snapshot -i` (the iframe's links get refs), click its "DOWNLOAD MP4" ref, then `agent-browser tab list`: a new blank tab means the click escaped to a top-level tab, where the attachment downloads. (`agent-browser download` times out there because the download happens in the new tab.) Close the tab and delete the file before committing.
