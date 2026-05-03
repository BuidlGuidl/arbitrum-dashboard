import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, FONT_STACK } from "../../data/assets";
import { SafeImage } from "../SafeImage";

/**
 * Scene 5 — Overview Demo (38–52s)
 * Scrolls through a tracker table with status + source-link columns.
 * Uses real screenshot if provided, else a high-fidelity table fallback.
 */
export const Scene5Overview: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      <SafeImage
        src={ASSETS.screenshots.overview}
        placeholderLabel="OVERVIEW TABLE"
        fallback={<TableFallback />}
        imgStyle={{ objectFit: "cover", objectPosition: "top" }}
      />
    </AbsoluteFill>
  );
};

const ROWS: {
  id: string;
  title: string;
  status: { label: string; tone: string };
  sources: string[];
}[] = [
  { id: "AIP-1.05", title: "Treasury allocation framework", status: { label: "Onchain · Active", tone: COLORS.tally }, sources: ["Forum", "Snapshot", "Tally"] },
  { id: "AIP-1.06", title: "Sequencer fee adjustment", status: { label: "Snapshot · Passed", tone: COLORS.snapshot }, sources: ["Forum", "Snapshot"] },
  { id: "AIP-1.07", title: "Stylus upgrade rollout plan", status: { label: "In discussion", tone: COLORS.forum }, sources: ["Forum"] },
  { id: "AIP-1.08", title: "Grants program continuation", status: { label: "Executed", tone: COLORS.success }, sources: ["Forum", "Snapshot", "Tally"] },
  { id: "AIP-1.09", title: "Validator set parameters", status: { label: "Snapshot · Active", tone: COLORS.snapshot }, sources: ["Forum", "Snapshot"] },
  { id: "AIP-1.10", title: "Long-term incentives review", status: { label: "In discussion", tone: COLORS.forum }, sources: ["Forum"] },
  { id: "AIP-1.11", title: "Bridge security update", status: { label: "Onchain · Active", tone: COLORS.tally }, sources: ["Forum", "Snapshot", "Tally"] },
  { id: "AIP-1.12", title: "STIP follow-up cohort", status: { label: "Executed", tone: COLORS.success }, sources: ["Forum", "Snapshot", "Tally"] },
  { id: "AIP-1.13", title: "Council compensation", status: { label: "Snapshot · Failed", tone: COLORS.danger }, sources: ["Forum", "Snapshot"] },
  { id: "AIP-1.14", title: "Documentation taskforce", status: { label: "In discussion", tone: COLORS.forum }, sources: ["Forum"] },
];

const TableFallback: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scroll = interpolate(
    frame,
    [fps * 1.2, durationInFrames - fps * 1.5],
    [0, 280],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Highlight pulse of status / source columns
  const colHighlight = interpolate(
    frame,
    [fps * 4, fps * 6, fps * 8, fps * 10],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 700 }}>Proposals</div>
        <div style={{ display: "flex", gap: 12 }}>
          <Pill label="All" active />
          <Pill label="In discussion" />
          <Pill label="Offchain" />
          <Pill label="Onchain" />
          <Pill label="Executed" />
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          background: COLORS.panel,
          border: `1px solid ${COLORS.panelLine}`,
          borderRadius: 18,
          overflow: "hidden",
          height: 760,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 320px 320px",
            padding: "20px 28px",
            background: COLORS.bgSoft,
            color: COLORS.textMuted,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            borderBottom: `1px solid ${COLORS.panelLine}`,
          }}
        >
          <div>ID</div>
          <div>Proposal</div>
          <div
            style={{
              color: COLORS.text,
              background: `rgba(40,160,240,${0.18 * colHighlight})`,
              padding: "4px 10px",
              borderRadius: 8,
              transform: `translateX(${0}px)`,
            }}
          >
            Status
          </div>
          <div
            style={{
              color: COLORS.text,
              background: `rgba(40,160,240,${0.18 * colHighlight})`,
              padding: "4px 10px",
              borderRadius: 8,
            }}
          >
            Sources
          </div>
        </div>

        <div style={{ overflow: "hidden", height: 700 }}>
          <div style={{ transform: `translateY(${-scroll}px)` }}>
            {ROWS.map(row => (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 320px 320px",
                  padding: "22px 28px",
                  borderBottom: `1px solid ${COLORS.panelLine}`,
                  alignItems: "center",
                  fontSize: 20,
                }}
              >
                <div style={{ color: COLORS.textMuted }}>{row.id}</div>
                <div style={{ color: COLORS.text, fontWeight: 500 }}>
                  {row.title}
                </div>
                <div>
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: `${row.status.tone}22`,
                      color: row.status.tone,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {row.status.label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {row.sources.map(src => (
                    <span
                      key={src}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        background: COLORS.bgSoft,
                        border: `1px solid ${COLORS.panelLine}`,
                        color: COLORS.textMuted,
                        fontSize: 14,
                      }}
                    >
                      {src} ↗
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pill: React.FC<{ label: string; active?: boolean }> = ({
  label,
  active,
}) => (
  <div
    style={{
      padding: "8px 16px",
      borderRadius: 999,
      background: active ? COLORS.accent : COLORS.panel,
      color: active ? COLORS.bg : COLORS.textMuted,
      border: `1px solid ${active ? COLORS.accent : COLORS.panelLine}`,
      fontSize: 16,
      fontWeight: 600,
    }}
  >
    {label}
  </div>
);
