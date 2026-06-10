import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Help Me Invest handles your personal information.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Legal" title="Privacy policy" />;
}
