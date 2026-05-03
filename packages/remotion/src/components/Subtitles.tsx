import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SUBTITLES } from "../data/subtitles";
import { COLORS, FONT_STACK } from "../data/assets";

/**
 * Lower-third captions. Renders the cue active at the current time.
 * Each cue fades in and out at its own boundaries.
 */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = SUBTITLES.find(c => t >= c.startSec && t < c.endSec);
  if (!active) return null;

  const startFrame = active.startSec * fps;
  const endFrame = active.endSec * fps;
  const fadeFrames = Math.min(12, (endFrame - startFrame) / 4);

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + fadeFrames, endFrame - fadeFrames, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const lift = interpolate(
    frame,
    [startFrame, startFrame + fadeFrames],
    [12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 90,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${lift}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          padding: "18px 32px",
          borderRadius: 14,
          background: "rgba(8, 12, 22, 0.72)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${COLORS.panelLine}`,
          color: COLORS.text,
          fontFamily: FONT_STACK,
          fontSize: 34,
          lineHeight: 1.35,
          fontWeight: 500,
          textAlign: "center",
          letterSpacing: 0.2,
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        {active.lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
};
