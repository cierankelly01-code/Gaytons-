import type { Metadata, Viewport } from "next";
import "./globals.css";
import { business } from "@/lib/menu";

export const metadata: Metadata = {
  title: `${business.name} — family deli in ${business.location}`,
  description:
    "A family-run deli in Bentley Heath. Fresh local produce, grazing boards and platters made by hand.",
  openGraph: {
    title: `${business.name} — family deli in ${business.location}`,
    description: "Fresh local produce and grazing boards, made by family.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5B6E3C",
  width: "device-width",
  initialScale: 1,
  // Allow the kiosk to sit nicely full-screen on an iPad.
  maximumScale: 1,
};

// Root layout is intentionally chrome-free. The public site adds its header/
// footer in (site)/layout.tsx; the in-store iPad tool uses its own minimal
// shell in (kiosk)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
