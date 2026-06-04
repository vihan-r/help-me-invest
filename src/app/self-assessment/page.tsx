import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Property self-assessment",
  description: "A short, no-pressure check-in on where you stand.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Self-assessment" title="Property self-assessment" />;
}
