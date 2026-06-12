import { LegalPage } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms and conditions",
  description: "The terms that govern use of Help Me Invest.",
  path: "/terms",
});

// Structural skeleton only — bodies are PLACEHOLDER, not real legal wording.
const SECTIONS = [
  {
    heading: "About these terms",
    body: "Placeholder text. The reviewed introduction to these terms will be supplied and replaces this paragraph.",
  },
  {
    heading: "Eligibility",
    body: "Placeholder text. Who can use Help Me Invest will be set out here in the final wording.",
  },
  {
    heading: "Your account",
    body: "Placeholder text. The terms covering account creation, security, and closure go here.",
  },
  {
    heading: "Using the platform",
    body: "Placeholder text. Acceptable use of the education library and the rest of the platform will be described here.",
  },
  {
    heading: "Education and partner introductions",
    body: "Placeholder text. How introductions work, and what they are and are not, will be set out here — Help Me Invest provides education and introductions, not financial advice.",
  },
  {
    heading: "Fees and payments",
    body: "Placeholder text. Any fees, when they apply, and how they are charged will be described here.",
  },
  {
    heading: "Disclaimers and limitations",
    body: "Placeholder text. Disclaimers and limitations of liability will be set out here in the final reviewed wording.",
  },
  {
    heading: "Changes to these terms",
    body: "Placeholder text. How and when these terms may change, and how you'll be notified, goes here.",
  },
  {
    heading: "Contact",
    body: "Placeholder text. How to contact us about these terms will be provided here.",
  },
];

export default function Terms() {
  return (
    <LegalPage title="Terms and conditions." docName="terms and conditions" sections={SECTIONS} />
  );
}
