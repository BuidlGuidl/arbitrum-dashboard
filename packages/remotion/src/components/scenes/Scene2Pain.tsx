import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, FONT_STACK } from "../../data/assets";
import { SafeImage } from "../SafeImage";

/**
 * Scene 2 — Pain Point / Clutter (8–18s)
 *
 * Windows fly in from left and right, stacking on top of each other
 * with slight rotations. Creates a "clutter / tab overload" sensation.
 * After the pile builds, the headline fades in: "Hard to track. Easy to miss context."
 */

interface ClutterWindow {
  /** Which side the window flies in from */
  from: "left" | "right";
  /** Final resting x,y center position */
  x: number;
  y: number;
  /** Rotation at rest (degrees) */
  rot: number;
  /** Image source */
  src: string;
  /** Tab bar label */
  label: string;
  /** Delay in frames before this window enters */
  delay: number;
  /** Width of the window */
  w: number;
  /** Height of the window */
  h: number;
  /** z-index */
  z: number;
}

export const Scene2Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Use all 6 intro screenshots (index + proposal) plus the tab clutter images
  const windows: ClutterWindow[] = [
    // First: the 3 original panels persist briefly then get overwhelmed
    {
      from: "left",
      x: 200, y: 300, rot: -3,
      src: ASSETS.intro.forumProposal,
      label: "Forum — Proposal",
      delay: 0, w: 440, h: 320, z: 1,
    },
    {
      from: "right",
      x: 1200, y: 280, rot: 4,
      src: ASSETS.intro.tallyProposal,
      label: "Tally — Proposal",
      delay: 6, w: 440, h: 320, z: 2,
    },
    {
      from: "left",
      x: 360, y: 440, rot: 5,
      src: ASSETS.intro.snapshotIndex,
      label: "Snapshot — All proposals",
      delay: 14, w: 460, h: 320, z: 3,
    },
    {
      from: "right",
      x: 1050, y: 380, rot: -6,
      src: ASSETS.intro.forumIndex,
      label: "Forum — Proposals list",
      delay: 22, w: 480, h: 340, z: 4,
    },
    {
      from: "left",
      x: 520, y: 260, rot: 3,
      src: ASSETS.intro.tallyIndex,
      label: "Tally — All proposals",
      delay: 30, w: 480, h: 340, z: 5,
    },
    {
      from: "right",
      x: 880, y: 500, rot: -4,
      src: ASSETS.intro.snapshotProposal,
      label: "Snapshot — Vote details",
      delay: 38, w: 440, h: 320, z: 6,
    },
    // Extra clutter: browser search tabs
    {
      from: "left",
      x: 160, y: 520, rot: 7,
      src: ASSETS.intro.tallyIndex,
      label: "Tally — Proposals list",
      delay: 48, w: 420, h: 300, z: 7,
    },
    {
      from: "right",
      x: 1300, y: 460, rot: -5,
      src: ASSETS.intro.tabClutterGpt,
      label: "Search: AIP stage",
      delay: 56, w: 420, h: 300, z: 8,
    },
    // One more overlap for maximum chaos
    {
      from: "left",
      x: 700, y: 340, rot: -2,
      src: ASSETS.intro.forumProposal,
      label: "Forum — Discussion",
      delay: 64, w: 460, h: 330, z: 9,
    },
  ];

  // Darken overlay as clutter builds — makes the headline pop
  const clutterProgress = interpolate(
    frame,
    [0, fps * 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const overlayOpacity = interpolate(clutterProgress, [0.7, 1], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT_STACK }}>
      {/* Whoosh sound effects for each window slide-in */}
      {windows.map((w, i) => (
        <Sequence key={`sfx-${i}`} from={w.delay}>
          <Audio
            src={ASSETS.audio.whoosh}
            volume={Math.max(0.15, 0.5 - i * 0.04)}
          />
        </Sequence>
      ))}

      {/* Stacking windows */}
      {windows.map((w, i) => (
        <ClutterPanel key={i} win={w} />
      ))}

      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COLORS.bg,
          opacity: overlayOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Headline appears after the pile */}
      <Headline />
    </AbsoluteFill>
  );
};

const ClutterPanel: React.FC<{ win: ClutterWindow }> = ({ win }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance with the configured delay
  const enter = spring({
    frame: frame - win.delay,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.8 },
  });

  // Where the window starts (off-screen left or right)
  const offX = win.from === "left" ? -win.w - 100 : 1920 + 100;

  const currentX = interpolate(enter, [0, 1], [offX, win.x - win.w / 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slight vertical bounce on landing
  const currentY = win.y - win.h / 2 + (1 - enter) * 20;

  // Rotation eases in
  const currentRot = win.rot * enter;

  // Subtle floating drift after landing
  const driftPhase = Math.max(0, frame - win.delay - 15);
  const drift = Math.sin((driftPhase / fps) * 1.2 + win.delay) * 3 * Math.min(1, enter);

  if (enter < 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: currentX,
        top: currentY + drift,
        width: win.w,
        height: win.h,
        borderRadius: 14,
        overflow: "hidden",
        background: COLORS.panel,
        border: `1px solid ${COLORS.panelLine}`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
        transform: `rotate(${currentRot}deg)`,
        opacity: Math.min(1, enter * 1.5),
        zIndex: win.z,
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          height: 32,
          background: COLORS.bgSoft,
          borderBottom: `1px solid ${COLORS.panelLine}`,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 7,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#ff5f57", opacity: 0.85 }} />
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#febc2e", opacity: 0.85 }} />
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#28c840", opacity: 0.85 }} />
        <div
          style={{
            marginLeft: 8,
            fontSize: 11,
            color: COLORS.textMuted,
            letterSpacing: 0.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {win.label}
        </div>
      </div>

      {/* Screenshot content */}
      <div style={{ width: "100%", height: win.h - 32 }}>
        <SafeImage
          src={win.src}
          placeholderLabel={win.label}
          imgStyle={{ objectFit: "cover", objectPosition: "top" }}
        />
      </div>
    </div>
  );
};

const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in quickly at the start of the scene
  const opacity = interpolate(frame, [fps * 0.3, fps * 1.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 20,
        pointerEvents: "none",
        color: COLORS.text,
        fontSize: 68,
        fontWeight: 700,
        letterSpacing: -1,
        lineHeight: 1.3,
        opacity,
        textShadow: "0 4px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)",
      }}
    >
      Hard to track. Easy to miss context.
    </div>
  );
};
