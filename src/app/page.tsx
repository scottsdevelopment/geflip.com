import type { Metadata } from "next";
import FlippingFinder from "@/components/FlippingFinder";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div>
      <h1 className="sr-only">OSRS Grand Exchange Flipping Finder - live margins, ROI and volume</h1>
      <FlippingFinder />
    </div>
  );
}
