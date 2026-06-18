import { pageMeta } from "@/lib/seo";
import { SSOCallback } from "./SSOCallback";

export const metadata = pageMeta({
  title: "Signing you in",
  description: "Completing your sign-in.",
  path: "/sso-callback",
  noindex: true,
});

export default function SSOCallbackPage() {
  return <SSOCallback />;
}
