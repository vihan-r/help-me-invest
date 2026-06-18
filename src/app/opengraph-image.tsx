import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Shared social card for every route (Open Graph + Twitter). Routes set their
// own og:title / og:description via `pageMeta`; this is the brand image behind
// them. Rendered at build time — the Newsreader display face is read from a
// committed local TTF (no network fetch), so it can't break CI.
export const alt = "Help Me Invest — property investing on your own terms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F6F7F4";
const EMERALD = "#0A4B34";
const MINT = "#A8D5B4";

const newsreader = readFileSync(join(process.cwd(), "src/app/fonts/Newsreader-Regular.ttf"));

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: EMERALD,
        color: PAPER,
        padding: "80px 88px",
        fontFamily: "Newsreader, Georgia, serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 34, letterSpacing: -0.5 }}>
        <span style={{ fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>help me</span>
        <span style={{ fontWeight: 500, marginLeft: 10, fontFamily: "system-ui, sans-serif" }}>
          invest
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Newsreader",
            fontSize: 84,
            lineHeight: 1.02,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Property investing on your own terms.
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            fontFamily: "system-ui, sans-serif",
            color: MINT,
          }}
        >
          Learn how it works. Get direct access. Call on experts when you&rsquo;re ready.
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Newsreader", data: newsreader, weight: 400, style: "normal" }],
    },
  );
}
