import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Help Me Invest account.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Accounts" title="Create account" />;
}
