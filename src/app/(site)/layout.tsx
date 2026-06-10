import { SiteFooter, SiteHeader } from "@/components";

/** Full site chrome — global header + footer — for all public/content pages. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
