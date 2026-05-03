import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, FONT_STACK } from "../../data/assets";

/**
 * Scene 4 — Walkthrough (29–72s)
 *
 * Plays the manual screen recording in a styled browser frame
 * with a smooth fade-in from the dark background.
 * At the end, fades to a closing card.
 */
export const SceneWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Recording cutoff: 90s into scene (= 2:02 total)
  const recordingEnd = fps * 90;

  // Fade in
  const fadeIn = interpolate(frame, [0, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out recording at the cutoff point
  const fadeOut = interpolate(
    frame,
    [recordingEnd - fps * 1.5, recordingEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle scale-up entrance
  const scale = interpolate(frame, [0, fps * 1.2], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        {/* Browser-style frame */}
        <div
          style={{
            width: 1760,
            borderRadius: 16,
            overflow: "hidden",
            background: COLORS.panel,
            border: `1px solid ${COLORS.panelLine}`,
            boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              height: 40,
              background: COLORS.bgSoft,
              borderBottom: `1px solid ${COLORS.panelLine}`,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#ff5f57", opacity: 0.85 }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#febc2e", opacity: 0.85 }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#28c840", opacity: 0.85 }} />
            <div
              style={{
                marginLeft: 16,
                fontSize: 14,
                color: COLORS.textMuted,
                letterSpacing: 0.3,
              }}
            >
              Arbitrum DAO Governance Tracker
            </div>
          </div>

          {/* Video content — cropped to remove real browser chrome + taskbar */}
          <div
            style={{
              width: "100%",
              height: 865,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <OffthreadVideo
              src={ASSETS.video.walkthrough}
              style={{
                width: "100%",
                display: "block",
                position: "absolute",
                top: -80,
                left: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Closing card (fades in during the last few seconds) */}
      <ClosingCard />
    </AbsoluteFill>
  );
};

const ClosingCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in as the recording fades out (90s into scene)
  const recordingEnd = fps * 90;
  const fadeIn = interpolate(
    frame,
    [recordingEnd - fps * 1, recordingEnd + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (fadeIn < 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.bg,
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
        A governance hub, not a voting interface.
      </div>
    </div>
  );
};
