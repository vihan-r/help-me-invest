import type { Metadata } from "next";
import { PagePlaceholder } from "@/components";

export const metadata: Metadata = {
  title: "Education",
  description: "Learn how property investing works, at your own pace.",
};

export default function Page() {
  return <PagePlaceholder eyebrow="Education" title="Education" />;
}
