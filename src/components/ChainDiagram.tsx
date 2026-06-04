import { Fragment } from "react";

export interface ChainLayer {
  label: string;
  /** Marks a layer where a clip is taken — renders the Emerald clip marker. */
  clip?: boolean;
}

function ChainNode({
  label,
  clip,
  terminal,
}: {
  label: string;
  clip?: boolean;
  terminal?: boolean;
}) {
  return (
    <div
      className={["chain-node", terminal ? "is-terminal" : "", clip ? "has-clip" : ""]
        .filter(Boolean)
        .join(" ")}
      data-reveal-chain=""
    >
      <div className="chain-node-box">
        <p className="chain-node-label">{label}</p>
      </div>
      {clip && (
        <div className="chain-node-clip" aria-hidden="true">
          <span className="chain-clip-line" />
          <span className="chain-clip-dot" />
          <span className="chain-clip-label">Clip taken</span>
        </div>
      )}
    </div>
  );
}

function ChainConnector() {
  return (
    <div className="chain-connector" aria-hidden="true">
      <span className="chain-connector-line" />
      <span className="chain-connector-arrow" />
    </div>
  );
}

export interface ChainDiagramProps {
  title?: string;
  layers: ChainLayer[];
  caption?: string;
  topLabel?: string;
  bottomLabel?: string;
}

/**
 * The brand's signature motif: a vertical stack of labelled layers between two
 * Emerald terminals, with thin Warm Mid-Grey connectors and an Emerald clip
 * marker branching off any layer that takes a clip. Labels are always
 * structural — never a profession.
 */
export function ChainDiagram({
  title = "The chain you can’t see.",
  layers,
  caption,
  topLabel = "Knowledge",
  bottomLabel = "The everyday investor",
}: ChainDiagramProps) {
  return (
    <figure className="chain-v2" data-reveal="">
      {title && <figcaption className="chain-title">{title}</figcaption>}
      <div className="chain-v2-stack">
        <ChainNode label={topLabel} terminal />
        {layers.map((layer, i) => (
          <Fragment key={i}>
            <ChainConnector />
            <ChainNode label={layer.label} clip={layer.clip} />
          </Fragment>
        ))}
        <ChainConnector />
        <ChainNode label={bottomLabel} terminal />
      </div>
      {caption && <p className="chain-caption">{caption}</p>}
    </figure>
  );
}

export interface PlatformDiagramProps {
  title?: string;
  topLabel?: string;
  bottomLabel?: string;
  caption?: string;
}

/**
 * The platform alternative shown beside the chain: two terminals joined by one
 * direct line, no layers and no clip markers. The directness is the story.
 */
export function PlatformDiagram({
  title = "The way Help Me Invest works.",
  topLabel = "Knowledge",
  bottomLabel = "The everyday investor",
  caption,
}: PlatformDiagramProps) {
  return (
    <figure className="chain-v2" data-reveal="">
      {title && <figcaption className="chain-title">{title}</figcaption>}
      <div className="chain-v2-stack is-platform">
        <ChainNode label={topLabel} terminal />
        <div className="platform-connector" aria-hidden="true">
          <span className="platform-connector-line" />
          <span className="platform-connector-label">Direct access</span>
          <span className="platform-connector-arrow" />
        </div>
        <ChainNode label={bottomLabel} terminal />
      </div>
      {caption && <p className="chain-caption">{caption}</p>}
    </figure>
  );
}
