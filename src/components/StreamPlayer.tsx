"use client";

import { useState } from "react";

export interface StreamPlayerProps {
  /** Cloudflare video UID (free videos) or a signed playback token (gated). */
  src: string;
  /** Cloudflare customer subdomain code (NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE). */
  customerCode: string;
  /** Optional badge text, e.g. "Module 02 · 11:02". */
  badge?: string;
  /** Accessible label for the poster button. */
  label: string;
}

/**
 * Branded video poster that swaps to the Cloudflare Stream player on click
 * (click-to-load keeps the brand poster + defers the player). `src` is either a
 * public video UID (free) or a short-lived signed token (gated) minted by the
 * server — the player can't reach a require-signed-URLs video without one.
 */
export function StreamPlayer({ src, customerCode, badge, label }: StreamPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="hero-video-frame">
        <iframe
          src={`https://customer-${customerCode}.cloudflarestream.com/${src}/iframe?autoplay=true`}
          title={label}
          allow="accelerated-2d-canvas; autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="hero-video"
      aria-label={label}
      onClick={() => setPlaying(true)}
    >
      <span className="video-play" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2.5v11l10-5.5z" />
        </svg>
      </span>
      {badge ? <span className="hero-video-badge">{badge}</span> : null}
    </button>
  );
}
