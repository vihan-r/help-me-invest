import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Manage your profile and communication preferences.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Account" title="Your profile" />;
}
