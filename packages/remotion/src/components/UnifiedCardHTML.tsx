import React from "react";

/**
 * Pixel-perfect HTML replica of the unified proposal card.
 * Replaces the blurry PNG screenshot for crisp rendering at any resolution.
 */

const C = {
  bg: "#ffffff",
  border: "#e8ecf2",
  text: "#1a2332",
  textMuted: "#6b7a90",
  textLight: "#8c99ab",
  labelUpper: "#6b7a90",
  green: "#10b981",
  greenBg: "#ecfdf5",
  greenBorder: "#a7f3d0",
  teal: "#14b8a6",
  tealBg: "#f0fdfa",
  tealBorder: "#99f6e4",
  forText: "#10b981",
  againstText: "#ef4444",
  barFor: "#3b82f6",
  barBg: "#e5e7eb",
  forum: "#10b981",
  snapshot: "#8b5cf6",
  tally: "#6366f1",
  logoGradient1: "#627eea",
  logoGradient2: "#3b5ccc",
};

const FONT =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const UnifiedCardHTML: React.FC = () => {
  return (
    <div
      style={{
        width: "fit-content",
        background: C.bg,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        gap: 0,
        fontFamily: FONT,
      }}
    >
      {/* ── Left: Proposal info ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          flex: "0 0 340px",
        }}
      >
        {/* Arbitrum logo */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `linear-gradient(135deg, #e8eaff, #d4d8ff)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArbitrumLogo />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: C.text,
              lineHeight: 1.35,
              letterSpacing: -0.2,
            }}
          >
            Transfer 6,000 ETH and Idle Stablecoins
            <br />
            from the Treasury to the Treasury
            <br />
            Management Portfolio
          </div>
          <div style={{ fontSize: 13, color: C.textMuted }}>
            by Entropy Advisors
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 999,
              border: `1.5px solid ${C.tealBorder}`,
              background: C.tealBg,
              color: C.teal,
              fontSize: 13,
              fontWeight: 600,
              alignSelf: "flex-start",
              marginTop: 2,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth={2.5}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Active On-chain Vote
          </div>
        </div>
      </div>

      {/* ── Offchain ── */}
      <div
        style={{
          flex: "0 0 120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          borderLeft: `1px solid ${C.border}`,
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
            <circle cx={12} cy={12} r={10} />
            <path d="M8 12l2 2 4-4" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.labelUpper, letterSpacing: 0.8, textTransform: "uppercase" as const }}>
            OFFCHAIN
          </span>
        </div>
        <div style={{ fontSize: 13, color: C.textMuted }}>Snapshot</div>
        <div
          style={{
            padding: "3px 10px",
            borderRadius: 4,
            background: C.greenBg,
            border: `1px solid ${C.greenBorder}`,
            color: C.green,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Passed
        </div>
        <div style={{ fontSize: 12, color: C.textLight }}>20d ago</div>
      </div>

      {/* ── Onchain ── */}
      <div
        style={{
          flex: "0 0 110px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          borderLeft: `1px solid ${C.border}`,
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2}>
            <rect x={3} y={3} width={18} height={18} rx={3} />
            <path d="M8 12l2 2 4-4" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.labelUpper, letterSpacing: 0.8, textTransform: "uppercase" as const }}>
            ONCHAIN
          </span>
        </div>
        <div style={{ fontSize: 13, color: C.textMuted }}>Tally</div>
        <div
          style={{
            padding: "3px 10px",
            borderRadius: 4,
            background: C.tealBg,
            border: `1px solid ${C.tealBorder}`,
            color: C.teal,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Active
        </div>
        <div style={{ fontSize: 12, color: C.textLight }}>just now</div>
      </div>

      {/* ── Last Activity ── */}
      <div
        style={{
          flex: "0 0 110px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          borderLeft: `1px solid ${C.border}`,
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth={2}>
            <circle cx={12} cy={12} r={10} />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.labelUpper, letterSpacing: 0.8, textTransform: "uppercase" as const }}>
            LAST ACTIVITY
          </span>
        </div>
        <div style={{ fontSize: 15, color: C.text, fontWeight: 500, marginTop: 8 }}>
          just now
        </div>
      </div>

      {/* ── Votes ── */}
      <div
        style={{
          flex: "0 0 200px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          borderLeft: `1px solid ${C.border}`,
          padding: "0 20px",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: C.labelUpper, letterSpacing: 0.8, textTransform: "uppercase" as const }}>
          VOTES
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: C.textMuted }}>For</span>
          <span style={{ color: C.forText, fontWeight: 600 }}>72.31M</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: C.textMuted }}>Against</span>
          <span style={{ color: C.againstText, fontWeight: 600 }}>264.22K</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: `1px solid ${C.border}`, paddingTop: 4 }}>
          <span style={{ color: C.textMuted }}>Total</span>
          <span style={{ color: C.text, fontWeight: 600 }}>72.58M</span>
        </div>
        {/* Progress bar */}
        <div style={{ width: "100%", height: 6, borderRadius: 3, background: C.barBg, marginTop: 2 }}>
          <div style={{ width: "99.6%", height: 6, borderRadius: 3, background: C.barFor }} />
        </div>
      </div>

      {/* ── Platform links ── */}
      <div
        style={{
          flex: "0 0 110px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          borderLeft: `1px solid ${C.border}`,
          padding: "0 20px",
        }}
      >
        <PlatformLink color={C.forum} label="Forum" icon="edit" />
        <PlatformLink color={C.snapshot} label="Snapshot" icon="zap" />
        <PlatformLink color={C.tally} label="Tally" icon="grid" />
      </div>
    </div>
  );
};

/* ─── Small sub-components ─── */

const PlatformLink: React.FC<{ color: string; label: string; icon: string }> = ({
  color,
  label,
  icon,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon === "edit" && (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )}
      {icon === "zap" && (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )}
      {icon === "grid" && (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
          <rect x={3} y={3} width={7} height={7} />
          <rect x={14} y={3} width={7} height={7} />
          <rect x={3} y={14} width={7} height={7} />
          <rect x={14} y={14} width={7} height={7} />
        </svg>
      )}
    </div>
    <span style={{ fontSize: 14, fontWeight: 600, color: "#1a2332" }}>
      {label}
    </span>
  </div>
);

const ArbitrumLogo: React.FC = () => (
  <svg width={28} height={28} viewBox="0 0 40 40" fill="none">
    <path
      d="M20.7 25.3l4.2-6.8 4.3 6.8-4.3 2.5-4.2-2.5z"
      fill="#28A0F0"
    />
    <path
      d="M20 3L6 11v18l14 8 14-8V11L20 3zm0 3.5L30.5 13v14L20 33.5 9.5 27V13L20 6.5z"
      fill="#213147"
    />
    <path
      d="M15.1 25.3L20 17l4.9 8.3L20 27.8l-4.9-2.5z"
      fill="#12AAFF"
      opacity={0.7}
    />
    <path
      d="M20 6.5L9.5 13v14L20 33.5 30.5 27V13L20 6.5z"
      fill="none"
      stroke="#96BEDC"
      strokeWidth={1.5}
    />
  </svg>
);
