import Link from "next/link";

export interface VideoModuleProps {
  /** 1-based module number (rendered zero-padded, e.g. "02"). */
  index: number;
  title: string;
  duration?: string;
  blurb: string;
  /** When set, the module is a link; otherwise a non-interactive article. */
  href?: string;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5v11l10-5.5z" />
    </svg>
  );
}

/**
 * A module row — a 16:9 video thumbnail (play affordance + duration) beside its
 * title and blurb. Used inside the Education locked zone (non-interactive there);
 * pass `href` to make it a real link once modules are unlocked.
 */
export function VideoModule({ index, title, duration = "00:00", blurb, href }: VideoModuleProps) {
  const num = String(index).padStart(2, "0");
  const inner = (
    <>
      <div className="video-placeholder" aria-hidden="true">
        <div className="video-play">
          <PlayIcon />
        </div>
        <span className="video-duration">{duration}</span>
      </div>
      <div className="video-module-meta">
        <p className="video-module-eyebrow">Module {num}</p>
        <h3 className="video-module-title">{title}</h3>
        <p className="video-module-blurb">{blurb}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        className="video-module video-module--link"
        href={href}
        aria-label={`Module ${num}, ${title}`}
      >
        {inner}
      </Link>
    );
  }
  return <article className="video-module">{inner}</article>;
}
