import { Button, Container, SiteFooter, SiteHeader } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Page not found",
  description: "The page you were after may have moved, or never existed.",
  noindex: true,
});

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Container width="body" className="py-2xl">
          <p className="eyebrow mb-sm">Page not found</p>
          <h1 className="h1">We couldn&rsquo;t find that page</h1>
          <p className="body-large mt-md">
            The page you were after may have moved, or never existed. Nothing is lost — here are a
            couple of ways back.
          </p>
          <div className="mt-lg flex flex-wrap gap-md">
            <Button variant="primary" href="/">
              Back to home
            </Button>
            <Button variant="secondary" href="/education">
              Explore education
            </Button>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
