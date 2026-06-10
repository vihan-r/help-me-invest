import type { Metadata } from "next";
import { SelfAssessmentShell } from "@/components";

export const metadata: Metadata = {
  title: "Property self-assessment",
  description:
    "A short, no-pressure check-in on where you stand today, where you want to be, and the gap between the two.",
};

export default function Page() {
  return <SelfAssessmentShell />;
}
