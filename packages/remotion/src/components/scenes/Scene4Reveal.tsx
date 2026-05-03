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
 * Scene 4 — Product Reveal (29–38s)
 * If `public/screenshots/homepage.png` exists, it renders the real homepage.
 * Otherwise a polished CSS hero+KPI fallback is shown.
 */
export const Scene4Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({
    frame,
    fps,
    config: { damping: 24, stiffness: 90, mass: 0.9 },
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: reveal,
          transform: `scale(${0.96 + reveal * 0.04})`,
        }}
      >
        <SafeImage
          src={ASSETS.screenshots.homepage}
          placeholderLabel="HOMEPAGE"
          fallback={<FallbackHero />}
          imgStyle={{ objectFit: "cover", objectPosition: "top" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          top: 80,
          padding: "10px 18px",
          borderRadius: 999,
          background: "rgba(40,160,240,0.16)",
          border: `1px solid ${COLORS.accent}55`,
          color: COLORS.accent,
          fontSize: 18,
          fontWeight: 600,
          opacity: interpolate(frame, [fps * 0.6, fps * 1.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Arbitrum DAO Governance Tracker
      </div>
    </AbsoluteFill>
  );
};

const FallbackHero: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: `radial-gradient(circle at 30% 20%, ${COLORS.accent}22, transparent 50%), ${COLORS.bg}`,
      padding: "180px 120px",
      color: COLORS.text,
      fontFamily: FONT_STACK,
      boxSizing: "border-box",
    }}
  >
    <div style={{ fontSize: 28, color: COLORS.textMuted, fontWeight: 500 }}>
      Arbitrum DAO Governance Tracker
    </div>
    <div
      style={{
        fontSize: 84,
        fontWeight: 700,
        letterSpacing: -1.5,
        marginTop: 24,
        maxWidth: 1300,
        lineHeight: 1.05,
      }}
    >
      One unified view of every Arbitrum proposal.
    </div>
    <div
      style={{
        fontSize: 26,
        color: COLORS.textMuted,
        marginTop: 22,
        maxWidth: 1100,
      }}
    >
      Discussion, offchain vote, and onchain execution — connected.
    </div>

    <div style={{ display: "flex", gap: 28, marginTop: 70 }}>
      <KpiCard label="Tracked proposals" value="312" tone={COLORS.accent} />
      <KpiCard label="In discussion" value="38" tone={COLORS.forum} />
      <KpiCard label="Active votes" value="11" tone={COLORS.snapshot} />
      <KpiCard label="Onchain executions" value="146" tone={COLORS.tally} />
    </div>
  </div>
);

const KpiCard: React.FC<{ label: string; value: string; tone: string }> = ({
  label,
  value,
  tone,
}) => (
  <div
    style={{
      width: 280,
      height: 140,
      borderRadius: 16,
      padding: "20px 24px",
      background: COLORS.panel,
      border: `1px solid ${tone}33`,
      boxShadow: `0 24px 60px rgba(0,0,0,0.4)`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div style={{ color: COLORS.textMuted, fontSize: 16 }}>{label}</div>
    <div style={{ color: tone, fontSize: 56, fontWeight: 700 }}>{value}</div>
  </div>
);
