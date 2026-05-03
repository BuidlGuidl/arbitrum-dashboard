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
 * Scene 6 — Search Flow (52–64s)
 * Search bar types `treasury`, results narrow, pause on a relevant row
 * with source links.
 */
export const Scene6Search: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      <SafeImage
        src={ASSETS.screenshots.searchTreasury}
        placeholderLabel="SEARCH SCREENSHOT"
        fallback={<SearchFallback />}
        imgStyle={{ objectFit: "cover", objectPosition: "top" }}
      />
    </AbsoluteFill>
  );
};

const TYPED = "treasury";

const ALL_ROWS = [
  { id: "AIP-1.05", title: "Treasury allocation framework", match: true,  status: "Onchain · Active",  tone: COLORS.tally },
  { id: "AIP-1.08", title: "Grants program continuation",  match: false, status: "Executed",          tone: COLORS.success },
  { id: "AIP-1.12", title: "Long-term treasury diversification", match: true, status: "Snapshot · Active", tone: COLORS.snapshot },
  { id: "AIP-1.04", title: "Sequencer fee adjustment",      match: false, status: "Executed",          tone: COLORS.success },
  { id: "AIP-1.18", title: "Treasury reporting cadence",    match: true,  status: "In discussion",     tone: COLORS.forum },
];

const SearchFallback: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Type "treasury" letter by letter between 0.6s and 2.5s
  const typingProgress = interpolate(frame, [fps * 0.6, fps * 2.5], [0, TYPED.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const typed = TYPED.slice(0, Math.floor(typingProgress));
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  // After typing, fade non-matches
  const filterProgress = interpolate(frame, [fps * 2.8, fps * 4.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "70px 100px",
        boxSizing: "border-box",
        color: COLORS.text,
        fontFamily: FONT_STACK,
        background: COLORS.bg,
      }}
    >
      <div style={{ fontSize: 38, fontWeight: 700, marginBottom: 30 }}>
        Find a proposal
      </div>

      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: COLORS.panel,
          border: `1px solid ${COLORS.accent}66`,
          borderRadius: 14,
          padding: "20px 24px",
          fontSize: 26,
          color: COLORS.text,
          boxShadow: `0 16px 40px ${COLORS.accent}22`,
        }}
      >
        <SearchIcon />
        <span>{typed}</span>
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 28,
            background: COLORS.accent,
            opacity: cursorBlink ? 1 : 0,
          }}
        />
        <span style={{ marginLeft: "auto", color: COLORS.textMuted, fontSize: 18 }}>
          {Math.max(1, ALL_ROWS.filter(r => r.match || filterProgress < 1).length)} results
        </span>
      </div>

      {/* Results */}
      <div
        style={{
          marginTop: 40,
          background: COLORS.panel,
          border: `1px solid ${COLORS.panelLine}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {ALL_ROWS.map((row, i) => {
          const dim = row.match ? 1 : 1 - filterProgress;
          const collapse = row.match ? 1 : 1 - filterProgress;
          const highlight =
            row.id === "AIP-1.05"
              ? interpolate(frame, [fps * 5, fps * 6.5], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0;

          return (
            <div
              key={row.id}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 280px 320px",
                padding: `${22 * collapse}px 28px`,
                borderBottom: `1px solid ${COLORS.panelLine}`,
                alignItems: "center",
                fontSize: 20,
                opacity: dim,
                height: 80 * collapse,
                overflow: "hidden",
                background:
                  row.id === "AIP-1.05"
                    ? `rgba(40,160,240,${0.12 * highlight})`
                    : "transparent",
                outline:
                  row.id === "AIP-1.05" && highlight > 0.2
                    ? `1px solid ${COLORS.accent}88`
                    : "none",
              }}
            >
              <div style={{ color: COLORS.textMuted }}>{row.id}</div>
              <div style={{ color: COLORS.text, fontWeight: 500 }}>
                <Highlighted text={row.title} term={typed || TYPED} />
              </div>
              <div>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: `${row.tone}22`,
                    color: row.tone,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {row.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Forum", "Snapshot", "Tally"].map(s => (
                  <span
                    key={s}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      background: COLORS.bgSoft,
                      border: `1px solid ${COLORS.panelLine}`,
                      color: COLORS.textMuted,
                      fontSize: 14,
                    }}
                  >
                    {s} ↗
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ClickPulse />
    </div>
  );
};

const Highlighted: React.FC<{ text: string; term: string }> = ({
  text,
  term,
}) => {
  if (!term) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: COLORS.accent, fontWeight: 700 }}>
        {text.slice(idx, idx + term.length)}
      </span>
      {text.slice(idx + term.length)}
    </>
  );
};

const SearchIcon: React.FC = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <circle cx={11} cy={11} r={7} stroke={COLORS.textMuted} strokeWidth={2} />
    <line
      x1={16}
      y1={16}
      x2={21}
      y2={21}
      stroke={COLORS.textMuted}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

const ClickPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = spring({
    frame: frame - fps * 6.5,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const opacity = interpolate(pulse, [0, 0.4, 1], [0, 0.6, 0]);
  const scale = interpolate(pulse, [0, 1], [0.6, 1.6]);
  return (
    <div
      style={{
        position: "absolute",
        left: 1380,
        top: 360,
        width: 60,
        height: 60,
        borderRadius: 999,
        border: `2px solid ${COLORS.accent}`,
        opacity,
        transform: `scale(${scale})`,
      }}
    />
  );
};
