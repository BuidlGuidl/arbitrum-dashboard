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
      <Audio src={ASSETS.audio.voiceover} />

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
