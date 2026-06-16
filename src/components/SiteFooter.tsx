import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { FOOTER_ENTITY, FOOTER_LEGAL, FOOTER_SITE } from "@/config/site";

/** Global site footer: brand line, Site + Legal link columns, registered-entity meta. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer-grid">
          <div className="site-footer-col">
            <Wordmark size={20} />
            <p className="body-small mt-4.5 max-w-[320px]">
              A platform for Australians investing on their own terms.
            </p>
          </div>

          <div className="site-footer-col">
            <h5>Site</h5>
            <ul>
              {FOOTER_SITE.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-col">
            <h5>Legal</h5>
            <ul>
              {FOOTER_LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="site-footer-meta fine-print">
          {FOOTER_ENTITY} · {year}
        </p>
      </div>
    </footer>
  );
}
