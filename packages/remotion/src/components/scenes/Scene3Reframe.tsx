import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_STACK } from "../../data/assets";
import { UnifiedCardHTML } from "../UnifiedCardHTML";

/**
 * Scene 3 — Reframe (18–29s)
 *
 * Vertical data-flow layout:
 *
 *   ┌────────┐  ┌──────────┐  ┌───────┐
 *   │ Forum  │  │ Snapshot  │  │ Tally │     ← source row
 *   └───┬────┘  └────┬─────┘  └───┬───┘
 *       │            │            │          ← flowing particles
 *       └────────────┼────────────┘
 *              ┌─────┴─────┐
 *              │ AI Matching│                ← merge node
 *              └─────┬─────┘
 *                    │                       ← output flow
 *         ┌──────────┴──────────┐
 *         │   Unified Card      │            ← result
 *         └─────────────────────┘
 */

const SOURCES = [
  { key: "forum", label: "Forum", sub: "Discussions", color: COLORS.forum, cx: 560 },
  { key: "snapshot", label: "Snapshot", sub: "Offchain votes", color: COLORS.snapshot, cx: 960 },
  { key: "tally", label: "Tally", sub: "Onchain votes", color: COLORS.tally, cx: 1360 },
] as const;

const SOURCE_Y = 260;
const CARD_W = 360;
const CARD_H = 130;
const MERGE_Y = 560;
const MERGE_CX = 960;
const OUTPUT_Y = 700;

export const Scene3Reframe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineOpacity = interpolate(
    frame,
    [fps * 0.4, fps * 1.4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const cardsIn = interpolate(
    frame,
    [fps * 0.8, fps * 2.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const aiNodeIn = spring({
    frame: frame - fps * 3.2,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const outputLinkIn = interpolate(
    frame,
    [fps * 4.5, fps * 5.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const cardIn = spring({
    frame: frame - fps * 5.5,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: 65,
          left: 0,
          right: 0,
          textAlign: "center",
          color: COLORS.text,
          fontSize: 68,
          fontWeight: 700,
          letterSpacing: -1,
          opacity: headlineOpacity,
        }}
      >
        Discussion. Vote. Execution.{" "}
        <span style={{ color: COLORS.accent }}>All linked in one place.</span>
      </div>

      {/* SVG layer: paths + particles */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {/* Source → AI Matching flows */}
        {SOURCES.map((s, i) => (
          <VerticalFlow
            key={s.key}
            fromX={s.cx}
            fromY={SOURCE_Y + CARD_H}
            toX={MERGE_CX}
            toY={MERGE_Y - 30}
            color={s.color}
            delayFrames={fps * (2.0 + i * 0.4)}
            index={i}
          />
        ))}

        {/* AI Matching → Unified Card link */}
        <line
          x1={MERGE_CX}
          y1={MERGE_Y + 30}
          x2={MERGE_CX}
          y2={OUTPUT_Y}
          stroke={COLORS.accent}
          strokeWidth={2}
          strokeDasharray="6 6"
          opacity={outputLinkIn * 0.6}
        />
        {/* Output arrow tip */}
        <polygon
          points={`${MERGE_CX - 6},${OUTPUT_Y - 8} ${MERGE_CX + 6},${OUTPUT_Y - 8} ${MERGE_CX},${OUTPUT_Y}`}
          fill={COLORS.accent}
          opacity={outputLinkIn * 0.8}
        />
      </svg>

      {/* Source cards */}
      {SOURCES.map((s, i) => (
        <SourceCard key={s.key} source={s} index={i} progress={cardsIn} />
      ))}

      {/* AI Matching node */}
      <AIMatchingNode progress={aiNodeIn} />

      {/* Unified card output */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: OUTPUT_Y,
          display: "flex",
          justifyContent: "center",
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 30}px) scale(1.5)`,
          transformOrigin: "top center",
        }}
      >
        <UnifiedCardHTML />
      </div>
    </AbsoluteFill>
  );
};

/* ─── AI Matching Node (animated dashed border) ─── */

const AI_W = 220;
const AI_H = 56;
const AI_R = 28; // border radius

const AIMatchingNode: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Perimeter of the rounded rect for dash animation
  const perimeter = 2 * (AI_W - 2 * AI_R) + 2 * (AI_H - 2 * AI_R) + 2 * Math.PI * AI_R;
  // Clockwise rotation: decrease dashoffset over time
  const dashOffset = -(frame / fps) * 60; // 60px/sec rotation speed

  return (
    <div
      style={{
        position: "absolute",
        left: MERGE_CX - AI_W / 2,
        top: MERGE_Y - AI_H / 2,
        width: AI_W,
        height: AI_H,
        opacity: progress,
        transform: `scale(${0.7 + progress * 0.3})`,
      }}
    >
      {/* Animated dashed border via SVG */}
      <svg
        width={AI_W}
        height={AI_H}
        style={{ position: "absolute", inset: 0 }}
      >
        <rect
          x={1}
          y={1}
          width={AI_W - 2}
          height={AI_H - 2}
          rx={AI_R}
          ry={AI_R}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={2}
          strokeDasharray="8 6"
          strokeDashoffset={dashOffset}
          opacity={0.7}
        />
      </svg>

      {/* Background fill */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: AI_R,
          background: `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.accent}11)`,
          boxShadow: `0 8px 40px ${COLORS.accent}22`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.accent,
            boxShadow: `0 0 12px ${COLORS.accent}`,
          }}
        />
        <div
          style={{
            color: COLORS.accent,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1.5,
          }}
        >
          AI MATCHING
        </div>
      </div>
    </div>
  );
};

/* ─── Source Card ─── */

const SourceCard: React.FC<{
  source: (typeof SOURCES)[number];
  index: number;
  progress: number;
}> = ({ source, index, progress }) => {
  const enterDelay = index * 0.15;
  const p = Math.max(0, Math.min(1, (progress - enterDelay) / (1 - enterDelay)));

  return (
    <div
      style={{
        position: "absolute",
        left: source.cx - CARD_W / 2,
        top: SOURCE_Y,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 16,
        background: COLORS.panel,
        border: `2px solid ${source.color}44`,
        boxShadow: `0 16px 40px ${source.color}15`,
        padding: "16px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
        opacity: p,
        transform: `translateY(${(1 - p) * -30}px)`,
      }}
    >
      <div
        style={{
          color: source.color,
          fontSize: 13,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {source.sub}
      </div>
      <div
        style={{
          color: COLORS.text,
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        {source.label}
      </div>
    </div>
  );
};

/* ─── Vertical Data Flow (paths + particles) ─── */

interface VerticalFlowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  delayFrames: number;
  index: number;
}

const VerticalFlow: React.FC<VerticalFlowProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  color,
  delayFrames,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pathProgress = interpolate(
    frame,
    [delayFrames, delayFrames + fps * 1.0],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Curve: go down from source, then bend toward the merge point
  const midY = fromY + (toY - fromY) * 0.6;
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const approxLen = Math.sqrt(dx * dx + dy * dy) * 1.3;

  // Flowing particles
  const PARTICLE_COUNT = 4;
  const particles: React.ReactNode[] = [];
  for (let p = 0; p < PARTICLE_COUNT; p++) {
    const cycleTime = fps * 1.8;
    const particleStart = delayFrames + fps * 0.5 + p * (cycleTime / PARTICLE_COUNT);
    const elapsed = frame - particleStart;
    if (elapsed < 0) continue;

    const t = (elapsed % cycleTime) / cycleTime;

    // Cubic bezier evaluation
    const u = 1 - t;
    // Control points: P0=from, P1=(fromX, midY), P2=(toX, midY), P3=to
    const px =
      u * u * u * fromX +
      3 * u * u * t * fromX +
      3 * u * t * t * toX +
      t * t * t * toX;
    const py =
      u * u * u * fromY +
      3 * u * u * t * midY +
      3 * u * t * t * midY +
      t * t * t * toY;

    const fadeIn = Math.min(1, elapsed / (fps * 0.2));
    const brightness = 0.4 + Math.sin(t * Math.PI) * 0.6;

    particles.push(
      <React.Fragment key={`${index}-${p}`}>
        <circle cx={px} cy={py} r={4} fill={color} opacity={fadeIn * brightness} />
        <circle cx={px} cy={py} r={10} fill={color} opacity={fadeIn * brightness * 0.15} />
      </React.Fragment>,
    );
  }

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={approxLen}
        strokeDashoffset={approxLen * (1 - pathProgress)}
        opacity={0.35}
      />
      {particles}
    </g>
  );
};
