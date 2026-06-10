import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Property strategy",
  description:
    "What to buy, where, why, and when — the platform's frameworks, taught from first principles.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Education · Property strategy" title="Property strategy" />;
}
