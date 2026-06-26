import type { Metadata, Viewport } from "next";
import "./globals.css";
import { business } from "@/lib/menu";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: `${business.name} — Grazing boards & platters, Bentley Heath`,
  description:
    "Fresh, generous grazing boards and platters made by family in Bentley Heath. Order ahead, collect in store. Pay on collection.",
  openGraph: {
    title: `${business.name} — Grazing boards & platters`,
    description:
      "Fresh, generous grazing boards for parties and gatherings. Order ahead, collect in store.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5B6E3C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
