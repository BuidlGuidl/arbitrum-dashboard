import React from "react";
import { AbsoluteFill, Audio, Sequence, Series } from "remotion";
import { ASSETS, COLORS, FONT_STACK } from "./data/assets";
import { SCENE_TIMINGS } from "./data/manifest";
import { Subtitles } from "./components/Subtitles";
import { SceneIntro } from "./components/scenes/SceneIntro";
import { Scene1Hook } from "./components/scenes/Scene1Hook";
import { Scene2Pain } from "./components/scenes/Scene2Pain";
import { Scene3Reframe } from "./components/scenes/Scene3Reframe";
import { SceneWalkthrough } from "./components/scenes/SceneWalkthrough";

const SCENE_COMPONENTS: Record<number, React.FC> = {
  0: SceneIntro,
  1: Scene1Hook,
  2: Scene2Pain,
  3: Scene3Reframe,
  4: SceneWalkthrough,
};

/**
 * Top-level composition. Scene durations come from the manifest, so to
 * retime a section just edit `arbitrum-video-assets/manifests/...`
 * (and re-copy to `src/data/manifest.json`).
 */
export const ArbitrumPromoVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{ background: COLORS.bg, fontFamily: FONT_STACK }}
    >
      <Audio src={ASSETS.audio.voiceover} playbackRate={1.2} />
      {/* voiceover2 part 1: starts at 49.2s (frame 1476) and plays until global 59s (duration 294 frames) */}
      <Sequence from={1476} durationInFrames={294}>
        <Audio src={ASSETS.audio.voiceover2} />
      </Sequence>

      {/* voiceover2 part 2: wait 4 seconds (from 59s to 63s), then resume from where it left off, and play until 69s (duration 180 frames) */}
      <Sequence from={1890} durationInFrames={180}>
        <Audio src={ASSETS.audio.voiceover2} startFrom={294} />
      </Sequence>

      {/* voiceover2 part 3: wait 3 seconds (from 69s to 72s), then resume from where it left off, and play until 91s (1:31) (duration 570 frames) */}
      <Sequence from={2160} durationInFrames={570}>
        <Audio src={ASSETS.audio.voiceover2} startFrom={474} />
      </Sequence>

      {/* voiceover2 part 4: wait 3 seconds (from 91s to 94s), then resume the rest of the audio track */}
      <Sequence from={2820}>
        <Audio src={ASSETS.audio.voiceover2} startFrom={1044} />
      </Sequence>

      <Series>
        {SCENE_TIMINGS.map(({ scene, durationFrames }) => {
          const Comp = SCENE_COMPONENTS[scene.id];
          return (
            <Series.Sequence
              key={scene.id}
              durationInFrames={durationFrames}
              name={`Scene ${scene.id} — ${scene.name}`}
            >
              <Comp />
            </Series.Sequence>
          );
        })}
      </Series>

      {/* Subtitles run for the full duration on a top layer */}
      <Sequence>
        <Subtitles />
      </Sequence>
    </AbsoluteFill>
  );
};
