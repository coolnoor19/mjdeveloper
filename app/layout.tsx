import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Newsreader } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.fullName}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    title: site.fullName,
    description: site.description,
    type: "website",
    images: [{ url: "/logo-full.jpg", width: 640, height: 501, alt: site.name }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f1ea",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${geist.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
