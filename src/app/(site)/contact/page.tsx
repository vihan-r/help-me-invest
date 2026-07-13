import { Arrow, ContactForm, TertiaryLink } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact",
  description: "Get in touch with the Help Me Invest team — we reply within a day.",
  path: "/contact",
});

export default function Contact() {
  return (
    <>
      {/* Header */}
      <section className="shell pt-16 pb-16">
        <h1 className="d1 col-display">
          Get <em>in touch.</em>
        </h1>
        <p className="body-large col-body mt-8">
          One of us will read your message and reply within a day. If your question is urgent or
          specific to a property decision you&rsquo;re making this week, say so, we&rsquo;ll route
          it to the right partner.
        </p>
      </section>

      {/* The form */}
      <section className="shell pb-24">
        <div className="col-body">
          <ContactForm />
        </div>
      </section>

      {/* Closing line */}
      <section className="shell pt-16 pb-40">
        <p>
          <TertiaryLink href="/find-an-expert">
            Talk to an expert <Arrow />
          </TertiaryLink>
        </p>
      </section>
    </>
  );
}
