import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import { ASSETS, COLORS, FONT_STACK } from "../../data/assets";

export const Scene5Rag: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleOpacity = interpolate(frame, [0, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({
    frame,
    fps,
    config: { damping: 14 },
  });

  const chatScale = spring({
    frame: frame - fps * 1,
    fps,
    config: { damping: 14 },
  });

  const pipelineOpacity = interpolate(frame, [fps * 2.5, fps * 3.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const message1Opacity = interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const message2Opacity = interpolate(frame, [fps * 4, fps * 4.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      {/* Title & Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: titleOpacity,
          transform: `translateY(${(1 - titleY) * -20}px)`,
        }}
      >
        <div
          style={{
            color: COLORS.accent,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          Next steps: Experiment with RAG
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 24, marginTop: 16 }}>
          Retrieval-augmented generation with the proposals data
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          bottom: 80,
          padding: "0 80px",
          gap: 80,
        }}
      >
        {/* Left Side: Mockup of RAG Chat */}
        <div
          style={{
            flex: 1,
            background: COLORS.panel,
            borderRadius: 16,
            border: `1px solid ${COLORS.panelLine}`,
            boxShadow: `0 24px 60px rgba(0,0,0,0.5)`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transform: `scale(${0.9 + chatScale * 0.1})`,
            opacity: chatScale,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: COLORS.bgSoft,
              padding: "16px 24px",
              borderBottom: `1px solid ${COLORS.panelLine}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: COLORS.accent,
              }}
            />
            <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 600 }}>
              Arbitrum AI Assistant
            </div>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {/* User Message */}
            <div
              style={{
                display: "flex",
                alignSelf: "flex-end",
                maxWidth: "80%",
                opacity: message1Opacity,
              }}
            >
              <div
                style={{
                  background: COLORS.accentSoft,
                  color: COLORS.text,
                  padding: "16px 20px",
                  borderRadius: "20px 20px 4px 20px",
                  fontSize: 20,
                  lineHeight: 1.5,
                }}
              >
                Are there any proposals related to gaming?
              </div>
            </div>

            {/* AI Message */}
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                maxWidth: "90%",
                opacity: message2Opacity,
              }}
            >
              <div
                style={{
                  background: COLORS.bgSoft,
                  border: `1px solid ${COLORS.panelLine}`,
                  color: COLORS.text,
                  padding: "20px 24px",
                  borderRadius: "20px 20px 20px 4px",
                  fontSize: 20,
                  lineHeight: 1.6,
                }}
              >
                <p style={{ margin: "0 0 16px 0" }}>
                  Yes — several Arbitrum governance proposals are related to gaming, including:
                </p>
                <ul style={{ margin: "0 0 16px 0", paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>Catalyze Gaming Ecosystem Growth on Arbitrum</li>
                  <li>GCP Council Timelines and Nomination Process</li>
                  <li>AGV Council Compensation Calibration</li>
                  <li>Extend AGV Council Term and Align Future Elections with Operational Cadence</li>
                </ul>
                <p style={{ margin: "0 0 16px 0", color: COLORS.textMuted }}>
                  These cover the Gaming Catalyst Program, council structure, compensation, and election timing.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <div style={{ fontSize: 14, color: COLORS.textMuted, width: "100%", marginBottom: 4 }}>
                    📄 9 Sources cited:
                  </div>
                  <SourcePill type="forum" title="Catalyze Gaming Ecosystem Growth on Arbitrum" />
                  <SourcePill type="snapshot" title="Catalyze Gaming Ecosystem Growth on Arbitrum" />
                  <SourcePill type="tally" title="Catalyze Gaming Ecosystem Growth on Arbitrum" />
                  <SourcePill type="forum" title="GCP Council Timelines and Nomination Process" />
                  <SourcePill type="snapshot" title="GCP Council Timelines and Nomination Process" />
                  <SourcePill type="forum" title="AGV Council Compensation Calibration" />
                  <SourcePill type="forum" title="Extend AGV Council Term and Align Future Elections..." />
                  <SourcePill type="snapshot" title="Extend AGV Council Term and Align Future Elections..." />
                  <SourcePill type="tally" title="Extend AGV Council Term and Align Future Elections..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: RAG Pipeline SVG */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: pipelineOpacity,
          }}
        >
          <Img
            src={ASSETS.rag.pipeline}
            style={{
              width: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 0 40px rgba(40, 160, 240, 0.1))",
              transform: "scale(1.1)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SourcePill: React.FC<{ type: "forum" | "snapshot" | "tally", title: string }> = ({ type, title }) => {
  const colors = {
    forum: COLORS.forum,
    snapshot: COLORS.snapshot,
    tally: COLORS.tally,
  };
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span
      style={{
        fontSize: 12,
        color: COLORS.textMuted,
        background: COLORS.bg,
        padding: "4px 8px",
        borderRadius: 8,
        border: `1px solid ${COLORS.panelLine}`,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        maxWidth: 240,
      }}
    >
      <span style={{ color: colors[type], fontWeight: 700 }}>{label}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
    </span>
  );
};
