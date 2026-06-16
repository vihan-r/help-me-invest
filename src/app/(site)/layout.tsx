import { SiteFooter, SiteHeader } from "@/components";

/** Full site chrome — global header + footer — for all public/content pages. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
