import { SelfAssessmentShell } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Property self-assessment",
  description:
    "A short, no-pressure check-in on where you stand today, where you want to be, and the gap between the two.",
  path: "/self-assessment",
});

export default function Page() {
  return <SelfAssessmentShell />;
}
