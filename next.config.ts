import type { NextConfig } from "next";

// Baseline security headers applied to every response. A full Content-Security-
// Policy is intentionally left for Phase 2 (Karan's security review) — it needs
// per-source tuning + a nonce for the inline boot script, and a wrong CSP fails
// closed. We stay on the default SSR output (no static export) since we rely on
// the dynamic OG image route and per-route metadata.
const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
