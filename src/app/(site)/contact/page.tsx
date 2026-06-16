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
          One of us will read your message and reply within a day. If it&rsquo;s about a specific
          property decision you&rsquo;re weighing up, say so and we&rsquo;ll route it to the right
          partner.
        </p>
      </section>

      {/* The form */}
      <section className="shell pb-24">
        <div className="col-body">
          <ContactForm />
        </div>
      </section>

      {/* Alternative routes */}
      <section className="shell section-md">
        <div className="col-body stack-md">
          <div>
            <h2 className="h4">By email</h2>
            <p className="body mt-2">
              <a className="inline-link" href="mailto:hello@helpmeinvest.com.au">
                hello@helpmeinvest.com.au
              </a>
              . Same person on the other end. Same reply time.
            </p>
          </div>
          <div>
            <h2 className="h4">By post</h2>
            <p className="body mt-2">
              Help Me Invest, Level 4, 100 Collins Street, Melbourne VIC 3000.
            </p>
          </div>
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
