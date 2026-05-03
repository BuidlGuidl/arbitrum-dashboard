import React, { useState } from "react";
import { Img } from "remotion";
import { PlaceholderAsset } from "./PlaceholderAsset";

interface SafeImageProps {
  src: string;
  placeholderLabel: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  /** Optional custom fallback — replaces the dashed placeholder on error. */
  fallback?: React.ReactNode;
}

/**
 * Renders an image. If the file is missing or fails to load, falls back
 * to a tasteful placeholder so the composition keeps working end-to-end.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  placeholderLabel,
  style,
  imgStyle,
  fallback,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{ width: "100%", height: "100%", ...style }}>
        {fallback ?? <PlaceholderAsset label={placeholderLabel} />}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", ...style }}>
      <Img
        src={src}
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          ...imgStyle,
        }}
      />
    </div>
  );
};
