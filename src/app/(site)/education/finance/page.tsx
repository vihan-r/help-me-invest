import { PagePlaceholder } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Finance",
  description:
    "How property is actually financed in Australia — the decisions that compound, and what your broker is and isn't paid to tell you.",
  path: "/education/finance",
});

export default function Page() {
  return <PagePlaceholder eyebrow="Education · Finance" title="Finance" />;
}
