import type { Metadata } from "next";
import { Arrow, ContactForm, TertiaryLink } from "@/components";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Help Me Invest team — we reply within a day.",
};

export default function Contact() {
  return (
    <main>
      {/* Header */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <h1 className="d1 col-display">
          Get <em>in touch.</em>
        </h1>
        <p className="body-large col-body" style={{ marginTop: 32 }}>
          One of us will read your message and reply within a day. If it&rsquo;s about a specific
          property decision you&rsquo;re weighing up, say so and we&rsquo;ll route it to the right
          partner.
        </p>
      </section>

      {/* The form */}
      <section className="shell" style={{ paddingBottom: 96 }}>
        <div className="col-body">
          <ContactForm />
        </div>
      </section>

      {/* Alternative routes */}
      <section className="shell section-md">
        <div className="col-body stack-md">
          <div>
            <h3 className="h4">By email</h3>
            <p className="body" style={{ marginTop: 8 }}>
              <a className="inline-link" href="mailto:hello@helpmeinvest.com.au">
                hello@helpmeinvest.com.au
              </a>
              . Same person on the other end. Same reply time.
            </p>
          </div>
          <div>
            <h3 className="h4">By post</h3>
            <p className="body" style={{ marginTop: 8 }}>
              Help Me Invest, Level 4, 100 Collins Street, Melbourne VIC 3000.
            </p>
          </div>
        </div>
      </section>

      {/* Closing line */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 160 }}>
        <p>
          <TertiaryLink href="/find-an-expert">
            Talk to an expert <Arrow />
          </TertiaryLink>
        </p>
      </section>
    </main>
  );
}
