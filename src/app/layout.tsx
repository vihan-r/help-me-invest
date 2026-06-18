import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import { RevealObserver } from "@/components";
import { SITE } from "@/config/site";
import "./globals.css";

// Body typeface — variable weight axis (400/500/600/700 used across the system).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

// Editorial display typeface — variable, with the optical-sizing (opsz) axis
// enabled so headlines can request `opsz` 72 / 36 as the source CSS does.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en-AU"
        className={`${jakarta.variable} ${newsreader.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="flex min-h-full flex-col">
          {/* Mark JS as available before paint so reveal-on-scroll elements are only
              hidden (opacity:0) when JS can reveal them — no-JS users see content. */}
          <script
            dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
          />
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <RevealObserver />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
