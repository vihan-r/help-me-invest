export interface LegalSection {
  heading: string;
  /** Placeholder body — NOT real legal copy. */
  body: string;
}

export interface LegalPageProps {
  title: string;
  /** Lowercase document name, e.g. "terms and conditions". */
  docName: string;
  sections: LegalSection[];
}

/**
 * Shared legal-page layout (Terms, Privacy). Renders a realistic legal document
 * structure — title, last-updated, numbered sections — filled with clearly
 * marked PLACEHOLDER text. No real legal wording is written here; the final
 * copy is supplied by the client and replaces the placeholders.
 */
export function LegalPage({ title, docName, sections }: LegalPageProps) {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="shell" style={{ paddingTop: 80, paddingBottom: 160 }}>
        <div className="col-reading">
          <p className="eyebrow">Legal</p>
          <h1 className="d1" style={{ marginTop: 16 }}>
            {title}
          </h1>
          <p className="body-small text-grey" style={{ marginTop: 24 }}>
            Last updated: [ placeholder date ]
          </p>

          <div
            className="bg-lighter-mint"
            style={{ borderRadius: 14, padding: "20px 22px", marginTop: 32 }}
          >
            <p className="body-small">
              <strong>Placeholder document.</strong> This is layout only — the final {docName}{" "}
              wording will be supplied by Help Me Invest and will replace everything below. Section
              headings show the intended structure; the body text is placeholder, not legal advice.
            </p>
          </div>

          <div className="stack-lg" style={{ marginTop: 56 }}>
            {sections.map((s, i) => (
              <section key={s.heading} className="stack-sm">
                <h2 className="h3">
                  {i + 1}. {s.heading}
                </h2>
                <p className="body">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
