import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Self-hosted via next/font: no render-blocking request to Google Fonts
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-inter", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cinzel", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#936039",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://geflip.com"),
  title: {
    default: "GEFlip.com - OSRS Grand Exchange Flipping Finder & Price Checker",
    template: "%s | GEFlip.com",
  },
  description:
    "Real-time OSRS GE prices, flipping margins, item database & profit calculator. Find the best Old School RuneScape flips with high volume and ROI.",
  keywords:
    "OSRS, Old School RuneScape, GE flipping, Grand Exchange, high alchemy calculator, OSRS profit calculator, RuneScape tools, OSRS flipper, GE prices, OSRS economy, flipping guide, alchemy profit calculator",
  authors: [{ name: "GE Flip" }],
  openGraph: {
    type: "website",
    url: "https://geflip.com",
    title: "GEFlip.com - OSRS Grand Exchange Flipping Finder & Price Checker",
    description:
      "Real-time OSRS GE prices, flipping margins, item database & profit calculator. Find the best Old School RuneScape flips with high volume and ROI.",
    siteName: "GE Flip",
    locale: "en_US",
    images: [
      {
        url: "/banner.png", // Assuming banner.png is in public folder, or keep the old one if it exists
        width: 1200,
        height: 630,
        alt: "GE Flip OSRS Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GEFlip.com - OSRS Grand Exchange Flipping Finder & Price Checker",
    description:
      "Real-time OSRS GE prices, flipping margins, item database & profit calculator. Find the best Old School RuneScape flips with high volume and ROI.",
    images: ["/banner.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <head>
        {/* Item icons are loaded from the wiki on every table page */}
        <link rel="preconnect" href="https://oldschool.runescape.wiki" />
        <link rel="preconnect" href="https://prices.runescape.wiki" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main className="p-3 sm:p-8">
          {children}
        </main>
        <footer className="text-center p-4 text-osrs-text-muted text-sm">
          <p className="text-sm font-bold mb-2">OSRS Flipping Tool & Price Checker</p>
          <p>
            Not affiliated with Jagex. Data provided by{" "}
            <a
              href="https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices"
              target="_blank"
              rel="noopener noreferrer"
              className="text-osrs-accent hover:underline"
            >
              RuneScape Wiki
            </a>
          </p>
          <p className="mt-2">
            Buy me a bond on{" "}
            <a
              href="https://ko-fi.com/scottsdevelopment"
              target="_blank"
              rel="noopener noreferrer"
              className="text-osrs-accent hover:underline"
            >
              Ko-fi
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
