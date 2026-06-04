import type { CSSProperties } from "react";

export interface PlaceholderProps {
  /** Aspect ratio token. */
  ratio?: "1x1" | "4x5" | "16x9" | "3x2";
  label: string;
  /** Emerald fill instead of Mint. */
  emerald?: boolean;
  style?: CSSProperties;
}

/** Editorial image placeholder — we do not invent photography. */
export function Placeholder({ ratio = "4x5", label, emerald = false, style }: PlaceholderProps) {
  return (
    <div
      className={["placeholder", `ratio-${ratio}`, emerald ? "emerald" : ""]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <span className="placeholder-label">{label}</span>
    </div>
  );
}

export interface EditorialPortraitProps {
  /** Image source. When omitted, a labelled placeholder renders instead. */
  src?: string;
  alt?: string;
  /** object-position, e.g. "50% 30%". */
  focus?: string;
  /** Scale applied to the image (the source default is 1.25). */
  zoom?: number;
  /** Placeholder label shown when there is no image. */
  label?: string;
}

/** A cropped editorial portrait inside a Lighter Mint frame, or a placeholder. */
export function EditorialPortrait({
  src,
  alt,
  focus,
  zoom,
  label = "[ Editorial portrait ]",
}: EditorialPortraitProps) {
  if (src) {
    return (
      <div className="editorial-portrait has-image">
        {/* eslint-disable-next-line @next/next/no-img-element -- custom object-fit + transform crop; not a candidate for next/image here */}
        <img
          src={src}
          alt={alt ?? ""}
          style={{ objectPosition: focus ?? "50% 50%", transform: `scale(${zoom ?? 1.25})` }}
        />
      </div>
    );
  }
  return (
    <div className="editorial-portrait">
      <span className="editorial-portrait-label">{label}</span>
    </div>
  );
}
