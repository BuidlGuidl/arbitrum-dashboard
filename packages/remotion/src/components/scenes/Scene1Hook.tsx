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
 * Scene 1 — Hook / Fragmentation (0–8s)
 * Three floating panels (Forum / Snapshot / Tally) ease in. A small
 * proposal card travels along thin connectors between them. Subtle push-in.
 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const PANEL_W = 700;
  const PANEL_H = 500;

  const panels = [
    {
      key: "forum",
      label: "Forum",
      img: ASSETS.intro.forumProposal,
      tint: COLORS.forum,
      x: -10,
      y: 440,
    },
    {
      key: "snapshot",
      label: "Snapshot",
      img: ASSETS.intro.snapshotProposal,
      tint: COLORS.snapshot,
      x: 610,
      y: 370,
    },
    {
      key: "tally",
      label: "Tally",
      img: ASSETS.intro.tallyProposal,
      tint: COLORS.tally,
      x: 1230,
      y: 440,
    },
  ];

  const pushIn = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Travel of the proposal card across the three panel centers
  const travel = interpolate(
    frame,
    [fps * 1.2, fps * 4, fps * 6.5],
    [0, 0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const cardCenters = panels.map(p => ({
    x: p.x + PANEL_W / 2,
    y: p.y + PANEL_H / 2,
  }));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const pos =
    travel < 0.5
      ? {
          x: lerp(cardCenters[0].x, cardCenters[1].x, travel * 2),
          y: lerp(cardCenters[0].y, cardCenters[1].y, travel * 2),
        }
      : {
          x: lerp(cardCenters[1].x, cardCenters[2].x, (travel - 0.5) * 2),
          y: lerp(cardCenters[1].y, cardCenters[2].y, (travel - 0.5) * 2),
        };

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      <SceneTitle text="One proposal. Three platforms. Multiple stages." />

      <div
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        {/* Connector lines */}
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          <line
            x1={cardCenters[0].x}
            y1={cardCenters[0].y}
            x2={cardCenters[1].x}
            y2={cardCenters[1].y}
            stroke={`${COLORS.accent}66`}
            strokeWidth={2}
            strokeDasharray="6 8"
          />
          <line
            x1={cardCenters[1].x}
            y1={cardCenters[1].y}
            x2={cardCenters[2].x}
            y2={cardCenters[2].y}
            stroke={`${COLORS.accent}66`}
            strokeWidth={2}
            strokeDasharray="6 8"
          />
        </svg>

        {panels.map((p, i) => (
          <FloatingPanel
            key={p.key}
            panel={p}
            index={i}
            panelW={PANEL_W}
            panelH={PANEL_H}
            travel={travel}
          />
        ))}

        {/* Traveling proposal card */}
        <div
          style={{
            position: "absolute",
            left: pos.x - 260,
            top: pos.y - 100,
            width: 520,
            height: 200,
            borderRadius: 20,
            background: COLORS.panel,
            border: `2px solid ${COLORS.accent}88`,
            boxShadow: `0 24px 80px ${COLORS.accent}44`,
            padding: "28px 36px",
            color: COLORS.text,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 20, color: COLORS.textMuted, letterSpacing: 0.5 }}>
            Non-Constitutional
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.3 }}>
            Transfer 6,000 ETH and idle Stablecoins
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

interface FloatingPanelProps {
  panel: {
    key: string;
    label: string;
    img: string;
    tint: string;
    x: number;
    y: number;
  };
  index: number;
  panelW: number;
  panelH: number;
  travel: number;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({ panel, index, panelW, panelH, travel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - index * 12,
    fps,
    config: { damping: 18, stiffness: 110 },
  });
  const float = Math.round(Math.sin((frame / fps) * 1.4 + index) * 6);

  // Highlight: each panel lights up when the card is near it
  // Panel 0 → travel ~0, Panel 1 → travel ~0.5, Panel 2 → travel ~1
  const panelTarget = index * 0.5; // 0, 0.5, 1
  const dist = Math.abs(travel - panelTarget);
  const highlight = Math.max(0, 1 - dist * 4); // peaks at 1 when card is on this panel

  const borderColor = highlight > 0.01
    ? `rgba(40, 160, 240, ${0.15 + highlight * 0.85})`
    : `${panel.tint}55`;
  const glowShadow = highlight > 0.01
    ? `0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px ${panel.tint}22, 0 0 ${20 + highlight * 30}px rgba(40, 160, 240, ${highlight * 0.4})`
    : `0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px ${panel.tint}22`;

  return (
    <div
      style={{
        position: "absolute",
        left: panel.x,
        top: panel.y + float,
        width: panelW,
        height: panelH,
        borderRadius: 18,
        overflow: "hidden",
        background: COLORS.panel,
        border: `2px solid ${borderColor}`,
        boxShadow: glowShadow,
        opacity: enter,
        transform: `translateY(${Math.round((1 - enter) * 30)}px)`,
        willChange: "transform",
        transition: "border-color 0.1s, box-shadow 0.1s",
      }}
    >
      <div
        style={{
          height: 44,
          background: COLORS.bgSoft,
          borderBottom: `1px solid ${COLORS.panelLine}`,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 10,
        }}
      >
        <Dot color="#ff5f57" />
        <Dot color="#febc2e" />
        <Dot color="#28c840" />
        <div
          style={{
            marginLeft: 14,
            fontSize: 20,
            fontWeight: 600,
            color: COLORS.text,
            letterSpacing: 0.3,
          }}
        >
          {panel.label}
        </div>
      </div>
      <div style={{ width: "100%", height: panelH - 44 }}>
        <SafeImage
          src={panel.img}
          placeholderLabel={panel.label}
          imgStyle={{ objectFit: "cover", objectPosition: "top" }}
        />
      </div>
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: 5,
      background: color,
      opacity: 0.85,
    }}
  />
);

const SceneTitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [fps * 0.4, fps * 1.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 0,
        right: 0,
        textAlign: "center",
        color: COLORS.text,
        fontSize: 68,
        fontWeight: 700,
        letterSpacing: -1,
        opacity,
      }}
    >
      {text}
    </div>
  );
};
