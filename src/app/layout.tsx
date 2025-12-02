import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#936039",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://geflip.com"),
  title: {
    default: "GEFlip.com - #1 OSRS Grand Exchange Flipping & Price Checker 2025",
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
    title: "GEFlip.com - #1 OSRS Grand Exchange Flipping & Price Checker 2025",
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
    site: "@geflip", // Placeholder or keep generic if unknown
    title: "GEFlip.com - #1 OSRS Grand Exchange Flipping & Price Checker 2025",
    description:
      "Real-time OSRS GE prices, flipping margins, item database & profit calculator. Find the best Old School RuneScape flips with high volume and ROI.",
    images: ["/banner.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico", // Assuming favicon.ico exists as seen in file list (typo in original was favico.ico but file list said favicon.ico)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="p-8">
          {children}
        </main>
        <footer className="text-center p-4 text-osrs-text-muted text-sm">
          <h1 className="text-sm font-bold mb-2">OSRS Flipping Tool & Price Checker</h1>
          <p>
            Data provided by{" "}
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
