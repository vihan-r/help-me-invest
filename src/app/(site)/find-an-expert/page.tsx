import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Talk to an expert",
  description: "Tell us what you need and we will make the right introduction.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Talk to an expert" title="Talk to an expert" />;
}
