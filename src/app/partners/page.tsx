import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Partners",
  description: "Meet the vetted experts you can choose to work with.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Partners" title="Partners" />;
}
