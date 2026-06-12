import { PagePlaceholder } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Property strategy",
  description:
    "What to buy, where, why, and when — the platform's frameworks, taught from first principles.",
  path: "/education/strategy",
});

export default function Page() {
  return <PagePlaceholder eyebrow="Education · Property strategy" title="Property strategy" />;
}
