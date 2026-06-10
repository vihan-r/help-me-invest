import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Finance",
  description:
    "How property is actually financed in Australia — the decisions that compound, and what your broker is and isn't paid to tell you.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Education · Finance" title="Finance" />;
}
