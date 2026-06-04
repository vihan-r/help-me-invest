import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Investor Stories",
  description: "Real Australians investing on their own terms.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Investor Stories" title="Investor Stories" />;
}
