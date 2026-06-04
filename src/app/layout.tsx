import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Help Me Invest",
  description:
    "Help Me Invest helps everyday Australians invest in property on their own terms — learn how property investing works, then choose how you want help.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
