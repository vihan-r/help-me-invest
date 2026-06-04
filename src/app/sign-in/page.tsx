import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Help Me Invest account.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Accounts" title="Sign in" />;
}
