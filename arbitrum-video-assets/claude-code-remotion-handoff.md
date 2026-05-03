# Claude Code Handoff — Build the Remotion Video

## Goal
Build a polished Remotion video for the Arbitrum DAO Governance Tracker using the provided asset pack. The video should be 1920x1080, 30fps, about 72 seconds long, with the supplied English-US voiceover as the timing backbone.

## What is already provided
Asset root:
`/home/pablo/arbitrum-video-assets`

Important files:
- `README.md`
- `brief/production-brief.md`
- `script/voiceover-script.md`
- `script/scene-timings.csv`
- `storyboard/storyboard.md`
- `manifests/remotion-scene-manifest.json`
- `subtitles/voiceover.srt`
- `audio/voiceover-us-explicit.mp3`
- `audio/voiceover-us-explicit.ogg`
- `prompts/image-prompts.md`

## What is not fully provided yet
The following may still need to be created or dropped in later:
- AI-generated intro motion assets (Forum / Snapshot / Tally panels, proposal card, connectors, browser-tab clutter, lifecycle strip, etc.)
- real screenshots or screen recordings from:
  - Forum
  - Snapshot
  - Tally
  - the actual product UI
- optional logo / brand assets
- optional background music

The implementation should be resilient to missing visual assets by using:
- graceful placeholders
- simple shape-based fallbacks
- text-driven layouts
until final assets are added.

## Creative direction
Read these first and follow them closely:
- `brief/production-brief.md`
- `storyboard/storyboard.md`
- `manifests/remotion-scene-manifest.json`

Key constraints:
- calm, credible, product-focused tone
- premium minimal SaaS/data-product aesthetic
- avoid hypey crypto visuals
- do NOT imply the product is a voting interface
- first ~30s = motion-graphics / concept
- last ~40s = real UI demo

## Timing source of truth
Use these in this priority order:
1. `audio/voiceover-us-explicit.mp3` as the primary timing anchor
2. `manifests/remotion-scene-manifest.json` for scene segmentation
3. `script/scene-timings.csv` as a cross-check
4. `subtitles/voiceover.srt` for captions

## What I want built
Create a Remotion composition that:
- uses the provided voiceover audio
- breaks the video into 7 scenes matching the manifest
- renders clean subtitles from the provided SRT or a parsed equivalent
- supports easy asset replacement later
- has clearly named scene components
- is easy to tweak for timing, copy, and media swaps

## Preferred implementation approach
Please structure the Remotion project so that:
- each scene is a separate component
- scene data comes from the JSON manifest where practical
- file paths for assets are centralized in one config/module
- missing assets fail softly with placeholders rather than crashing
- there is one obvious top-level composition for final render

Suggested structure:
- `src/Root.tsx`
- `src/Video.tsx`
- `src/data/sceneManifest.ts` or JSON import wrapper
- `src/data/assets.ts`
- `src/components/scenes/Scene1Hook.tsx`
- `src/components/scenes/Scene2Pain.tsx`
- `src/components/scenes/Scene3Reframe.tsx`
- `src/components/scenes/Scene4Reveal.tsx`
- `src/components/scenes/Scene5Overview.tsx`
- `src/components/scenes/Scene6Search.tsx`
- `src/components/scenes/Scene7Close.tsx`
- `src/components/Subtitles.tsx`
- `src/components/PlaceholderAsset.tsx`
- `public/assets/...`

## Asset ingestion expectations
Please copy or wire the provided files into the Remotion project in a maintainable way.

At minimum:
- the final voiceover MP3 should be usable by Remotion locally
- the SRT should be parsable for subtitle rendering
- the JSON manifest should drive scene text and durations

If needed, duplicate the source assets from `/home/pablo/arbitrum-video-assets` into the Remotion project's `public/` or `src/data/` directories, but preserve clear mapping back to the originals.

## Visual behavior by scene
### Scene 1 — Hook / Fragmentation (0–8s)
- three floating panels: Forum, Snapshot, Tally
- one proposal card moving between them
- thin connectors
- subtle push-in

### Scene 2 — Pain Point (8–18s)
- more tabs/windows/cards appear
- sense of manual cross-platform searching
- clutter builds but remains readable

### Scene 3 — Reframe (18–29s)
- messy system collapses into one clean lifecycle row
- Forum → Snapshot → Tally progression
- status tags appear

### Scene 4 — Product Reveal (29–38s)
- reveal real product homepage
- hold on title / KPI area
- clean reveal, no visual chaos

### Scene 5 — Overview Demo (38–52s)
- scroll or simulated movement into product table
- highlight status/source-link columns
- keep text legible

### Scene 6 — Search Flow (52–64s)
- search term: `treasury`
- results narrow
- pause on a relevant row with source links

### Scene 7 — Close (64–72s)
- calm final dashboard hold
- overlay end-card message
- reinforce: tracker, not voting app

## Subtitle behavior
Subtitles should:
- be clean and minimal
- not dominate the frame
- stay readable over both motion-graphic and UI scenes
- preferably render as lower-third captions
- respect line breaks where sensible

## Important copy / positioning guardrails
Use exact or near-exact provided copy from the manifest/script.
Do not introduce messaging that implies:
- voting inside the product
- trading
- "all-in-one governance super app"
- overblown crypto-marketing language

## Delivery expectations
Please produce:
1. the working Remotion project/code
2. clear instructions for how to preview and render
3. a short note listing which placeholders still need replacement
4. one obvious place to swap in final generated art/screenshots when ready

## If assets are still missing
If some visual assets are not present yet, implement tasteful placeholders now so the video can already be previewed end-to-end.

Examples:
- generic floating cards for Forum/Snapshot/Tally panels
- CSS/SVG connectors and arrows
- simple tab clutter illustrations using native shapes
- placeholder blocks for screenshots/recordings

## Suggested prompt for Claude Code
Use this as the task prompt:

"Build a Remotion video project for the Arbitrum DAO Governance Tracker using the asset pack at /home/pablo/arbitrum-video-assets. Read the brief, storyboard, timings CSV, SRT, and manifest first. Use /home/pablo/arbitrum-video-assets/audio/voiceover-us-explicit.mp3 as the main timing/audio source. Create a 1920x1080, 30fps, ~72-second video with 7 scenes matching the manifest. First ~30 seconds should be motion-graphics style with placeholders or simple generated shapes if final assets are missing. Last ~40 seconds should be structured for real UI demo footage/screenshots. Implement clean subtitles from the SRT. Keep the tone calm, premium, credible, and product-focused. Do not imply the product is a voting interface. Build the code so assets are easy to replace later. Include scene components, centralized asset configuration, and graceful fallbacks for missing assets. Then tell me how to preview and render it, and list any remaining placeholder assets I should provide."