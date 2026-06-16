import Link from "next/link";
import { EditorialPortrait, Placeholder } from "./Placeholder";

export interface InvestorCardProps {
  name: string;
  age: number | string;
  city: string;
  /** The editorial "decision" line, set in Newsreader. */
  decision: string;
  href: string;
  /** Optional portrait image; falls back to an editorial placeholder. */
  image?: string;
  focus?: string;
  zoom?: number;
}

/** Investor story card — editorial, not a testimonial. */
export function InvestorCard({
  name,
  age,
  city,
  decision,
  href,
  image,
  focus,
  zoom,
}: InvestorCardProps) {
  return (
    <Link
      className="investor-profile"
      href={href}
      data-reveal=""
      aria-label={`Read ${name}’s story`}
    >
      <EditorialPortrait
        src={image}
        focus={focus}
        zoom={zoom}
        alt={image ? `Portrait of ${name}` : undefined}
      />
      <p className="investor-meta">
        {name} · {age} · {city}
      </p>
      <p className="investor-decision">{decision}</p>
      <p className="investor-cta">Read {name}&rsquo;s story →</p>
    </Link>
  );
}

export interface PartnerCardProps {
  name: string;
  /** One-line summary of what the partner does for the customer. */
  role: string;
  bio: string;
  href: string;
  portraitLabel?: string;
}

/** Partner card — clickable, links to the partner bio. */
export function PartnerCard({
  name,
  role,
  bio,
  href,
  portraitLabel = "[ Partner portrait ]",
}: PartnerCardProps) {
  return (
    <Link
      className="partner-card stack-md"
      href={href}
      data-reveal=""
      aria-label={`Read ${name} — full bio`}
    >
      <Placeholder ratio="4x5" label={portraitLabel} />
      <div className="stack-sm">
        <h3 className="h4">{name}</h3>
        <p className="body-small" style={{ fontWeight: 500 }}>
          {role}
        </p>
        <p className="body" style={{ marginTop: 8 }}>
          {bio}
        </p>
        <p className="partner-card-cta">Read the full bio →</p>
      </div>
    </Link>
  );
}
