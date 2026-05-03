import React from "react";
import { COLORS, FONT_STACK } from "../data/assets";

interface PlaceholderAssetProps {
  label: string;
  width?: number | string;
  height?: number | string;
  accent?: string;
  style?: React.CSSProperties;
}

export const PlaceholderAsset: React.FC<PlaceholderAssetProps> = ({
  label,
  width = "100%",
  height = "100%",
  accent = COLORS.accent,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        background:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 14px, rgba(255,255,255,0.05) 14px 28px)",
        border: `2px dashed ${accent}55`,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.textMuted,
        fontFamily: FONT_STACK,
        fontSize: 18,
        letterSpacing: 1,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {label}
    </div>
  );
};
