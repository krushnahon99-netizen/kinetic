# HANDOFF: 15s Motion Design Showreel (status: ~15%, setup only, no video code yet)

Continue this task. Plan and setup decisions are already made. Don't re-research, just build.

TASK: Make a dynamic 15-second motion graphics video: your own motion-design showreel for a résumé. Go all out.

STACK: Existing Next.js 16 App Router + Tailwind scaffold, pnpm. Remotion 4.0.539 (all remotion/@remotion/* packages pinned to this exact version).

SETUP (already run in the original project; redo in a fresh one):
- pnpm add --save-exact remotion@4.0.539 @remotion/player@4.0.539 @remotion/fonts@4.0.539 @remotion/noise@4.0.539 @remotion/paths@4.0.539 @remotion/media@4.0.539
- pnpm add --save-exact -D @remotion/cli@4.0.539
- In pnpm-workspace.yaml set allowBuilds -> esbuild: true (replace the placeholder), then pnpm install
- Fonts into public/showreel/fonts/:
  curl -fsSL -o Archivo-Variable.ttf "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf"   (axes: wdth 62-125, wght 100-900)
  curl -fsSL -o JetBrainsMono-Variable.ttf "https://github.com/google/fonts/raw/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
- pnpm exec remotion browser ensure

FILES:
- remotion/index.ts: registerRoot(RemotionRoot). Never import this file from the Next app.
- remotion/root.tsx: <Composition id="Showreel" component={Showreel} durationInFrames={450} fps={30} width={1920} height={1080} />
- remotion/showreel.tsx: scenes as back-to-back <Sequence>s + persistent overlays (grain, HUD, crop marks, letterbox)
- remotion/scenes/*.tsx (one file per scene), remotion/lib/theme.ts, easing.ts, fonts.ts
- components/showreel-player.tsx ("use client"): <Player component={Showreel} durationInFrames={450} fps={30} compositionWidth={1920} compositionHeight={1080} controls loop autoPlay style={{width:"100%"}} />
- app/page.tsx: dark showcase page with the player, a Download MP4 link (/showreel/showreel.mp4) and a short list of techniques. Update layout.tsx metadata + viewport themeColor.

RULES (known pitfalls):
- Inside remotion/: inline styles only (the CLI renderer doesn't run Tailwind) and relative imports only (no "@/" alias).
- Drive everything from useCurrentFrame(). No CSS transitions/keyframes, no Math.random() (use random(seed) from remotion).
- Always clamp interpolate (extrapolateLeft/Right: "clamp").
- Fonts: loadFont({ family, url: staticFile("showreel/fonts/...") }) from @remotion/fonts.
- No linear moves. expoOut = Easing.bezier(0.16,1,0.3,1), expoIn = Easing.bezier(0.7,0,0.84,0), expoInOut = Easing.bezier(0.87,0,0.13,1). Overshoot: spring({frame, fps, config:{damping:12, stiffness:180, mass:0.6}}).

LOOK:
- Palette: Ink #0B0B0C, Bone #F2EFE8, Signal #FF4D1F, Cobalt #2B4DFF (sparingly).
- Type: Archivo, animate fontVariationSettings "'wdth' X, 'wght' Y" for kinetic stretch. JetBrains Mono for HUD/labels.
- 120 BPM grid: 1 beat = 15 frames, 1 bar = 60 frames. Cuts and hits land on beats.
- Overlays the whole time: film grain (SVG feTurbulence, seed changes per frame, about 6% opacity), corner crop marks, HUD (top-left "v0 — MOTION REEL 2026", top-right SMPTE timecode, bottom-left "02/04 — SHAPE", bottom-right blinking REC dot).
- Transitions are "cover cuts": a slat wipe, iris, whip-pan smear or color flash frame covers the whole frame exactly at the cut.

STORYBOARD (frames):
0-30 BOOT: crop marks snap in, a Signal line draws edge to edge (evolvePath), mono text types "LOADING REEL_2026.MOV", the line collapses to a dot.
30-105 TITLE: the dot pops, giant "v0" slams in (spring overshoot + RGB-split ghosts), "MOTION DESIGNER" letters rise out of masks with wdth 62->125 breathing, mono "SELECTED WORK 2024—2026". Slat wipe out.
105-165 01 KINETIC TYPE: one word per beat, "TIMING." "SPACING." "EASING." "RHYTHM.", and the background color flips every beat. Skew/stretch with trailing ghost copies (fake motion blur).
165-225 02 SHAPE: circle->square->triangle->star morph (interpolatePath), orbiting satellites, a 16x9 dot grid rippling out from the center.
225-285 03 GENERATIVE: about 300 particles in a noise3D flow field (SVG) that converge into a ring on the downbeat. Iris wipe out.
285-345 04 DEPTH: CSS 3D perspective, an infinite-zoom tunnel of nested frames plus a rotating type cube "MAKE / IT / MOVE".
345-375 MONTAGE: a 3x3 tile grid flips with rapid 4-frame flashes of earlier motifs, then a whip-pan into the finale.
375-450 FINALE: everything collapses to the center. Lockup "v0" + Signal circle, "MOTION DESIGN REEL 2026", a blinking "AVAILABLE FOR HIRE" pill, "v0.app". On the last beat the letterbox closes to black.

VERIFY & RENDER:
- Review stills (open the PNGs): pnpm exec remotion still remotion/index.ts Showreel /tmp/f70.png --frame=70 (also 15, 130, 195, 255, 315, 360, 430). Fix clipping, overflow or empty frames.
- Final: pnpm exec remotion render remotion/index.ts Showreel public/showreel/showreel.mp4 --codec=h264 --crf=18 (run in background with a timeout).
- Screenshot the page once with agent-browser.

OPTIONAL SOUND: a Node script synthesizes a 15s 120 BPM WAV (kick on every beat, off-beat hats, noise whooshes at cuts, sub impact at frame 375) -> public/showreel/reel.wav. Add it with <Audio src={staticFile("showreel/reel.wav")} /> from @remotion/media.
