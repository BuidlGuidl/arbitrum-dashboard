import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT_STACK } from "../../data/assets";

export const Scene6Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in over the first 0.5 seconds
  const fadeIn = interpolate(
    frame,
    [0, fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          opacity: fadeIn,
          zIndex: 10,
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -1,
            textAlign: "center",
          }}
        >
          Arbitrum DAO Governance Tracker
        </div>
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 28,
            fontWeight: 400,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          A governance hub for proposals.
        </div>
      </div>
    </AbsoluteFill>
  );
};
