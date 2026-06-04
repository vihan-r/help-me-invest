import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "How it works",
  description: "How Help Me Invest works — education, introductions, and transparency.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="How it works" title="How it works" />;
}
