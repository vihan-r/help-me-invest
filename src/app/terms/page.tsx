import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The terms that govern use of Help Me Invest.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Legal" title="Terms and conditions" />;
}
