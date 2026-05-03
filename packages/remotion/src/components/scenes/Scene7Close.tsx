import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, FONT_STACK } from "../../data/assets";
import { SafeImage } from "../SafeImage";

/**
 * Scene 7 — Close (64–72s)
 * Calm dashboard hold (real screenshot if available) with a final overlay
 * end-card reinforcing positioning.
 */
export const Scene7Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const cardEnter = spring({
    frame: frame - fps * 0.8,
    fps,
    config: { damping: 22, stiffness: 90 },
  });

  const dim = interpolate(frame, [fps * 0.4, fps * 1.6], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 1, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK, opacity: fadeOut }}>
      <SafeImage
        src={ASSETS.screenshots.closeHold}
        placeholderLabel="DASHBOARD HOLD"
        fallback={<DashboardHold />}
        imgStyle={{ objectFit: "cover", objectPosition: "top" }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(5, 8, 16, ${dim})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: cardEnter,
            transform: `translateY(${(1 - cardEnter) * 24}px)`,
            textAlign: "center",
            color: COLORS.text,
            padding: "60px 80px",
            borderRadius: 22,
            background: "rgba(10, 15, 28, 0.78)",
            border: `1px solid ${COLORS.panelLine}`,
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: COLORS.accent,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Arbitrum DAO Governance Tracker
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -1,
              marginTop: 22,
              maxWidth: 1200,
              lineHeight: 1.1,
            }}
          >
            A governance hub.{" "}
            <span style={{ color: COLORS.textMuted }}>Not a voting interface.</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 24,
              color: COLORS.textMuted,
            }}
          >
            Understand what is happening — before you do.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DashboardHold: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: `radial-gradient(circle at 70% 80%, ${COLORS.accent}1c, transparent 50%), ${COLORS.bg}`,
    }}
  />
);
