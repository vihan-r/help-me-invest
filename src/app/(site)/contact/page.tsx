import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Help Me Invest team.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Contact" title="Contact" />;
}
