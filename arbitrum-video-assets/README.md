# Arbitrum Governance Tracker — Remotion Asset Pack

This pack contains all non-image assets needed to build the promo/demo video in Remotion.

## Recommended output
- Format: 16:9
- Resolution: 1920x1080
- Duration: ~72 seconds
- Tone: clean, credible, product-focused
- Structure: motion-graphics intro + real UI demo

## Files
- `brief/production-brief.md` — creative direction and constraints
- `script/voiceover-script.md` — final narration + on-screen text
- `script/scene-timings.csv` — durations and beat timing
- `storyboard/storyboard.md` — shot-by-shot visual plan
- `manifests/remotion-scene-manifest.json` — structured scene data for implementation
- `subtitles/voiceover.srt` — subtitle file
- `prompts/image-prompts.md` — prompts for generating the needed still assets externally
- `audio/voiceover.txt` — plain narration text used for TTS
- `audio/voiceover.mp3` — optional generated voiceover

## Suggested folder for external assets you generate
- `images/logo/`
- `images/mockups/`
- `images/icons/`
- `ui-recordings/`

## UI recordings to capture manually
1. Homepage load with title + stat cards visible
2. Smooth scroll into proposal table
3. Search interaction for `treasury`
4. Pause on a row that shows Forum / Snapshot / Tally links
5. Optional slow zoom on KPI cards

## Notes for editor/developer
- Keep first ~30 seconds motion-graphic heavy
- Keep last ~40 seconds as real UI demo
- Avoid hypey crypto aesthetics
- Product is a tracker/index, not a voting interface
