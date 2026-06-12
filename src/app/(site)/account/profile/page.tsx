import { PagePlaceholder } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Your profile",
  description: "Manage your profile and communication preferences.",
  path: "/account/profile",
  noindex: true,
});

export default function Page() {
  return <PagePlaceholder eyebrow="Account" title="Your profile" />;
}
