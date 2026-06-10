import type { Metadata } from "next";
import { LegalPage } from "@/components";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Help Me Invest handles your personal information.",
};

// Structural skeleton only — bodies are PLACEHOLDER, not real legal wording.
const SECTIONS = [
  {
    heading: "What we collect",
    body: "Placeholder text. The categories of personal information we collect will be listed here in the final wording.",
  },
  {
    heading: "How we use your information",
    body: "Placeholder text. The purposes we use your information for will be set out here.",
  },
  {
    heading: "When we share information",
    body: "Placeholder text. Who we share information with, and why, will be described here — including how introductions to partners work.",
  },
  {
    heading: "Storage and security",
    body: "Placeholder text. How and where your information is stored, and how we keep it safe, goes here.",
  },
  {
    heading: "Cookies and analytics",
    body: "Placeholder text. Our use of cookies and privacy-respecting analytics, and your choices, will be described here.",
  },
  {
    heading: "Your rights and choices",
    body: "Placeholder text. How you can access, correct, or ask us to delete your information will be set out here.",
  },
  {
    heading: "Changes to this policy",
    body: "Placeholder text. How and when this policy may change, and how you'll be notified, goes here.",
  },
  {
    heading: "Contact",
    body: "Placeholder text. How to contact us about your privacy will be provided here.",
  },
];

export default function Privacy() {
  return <LegalPage title="Privacy policy." docName="privacy policy" sections={SECTIONS} />;
}
