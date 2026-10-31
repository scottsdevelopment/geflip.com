import AlchemyCalculator from "@/components/AlchemyCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OSRS High Alchemy Calculator - Profit & ROI",
    alternates: { canonical: "/alchemy" },
    description: "Calculate high alchemy profits for Old School RuneScape items. Find the best items to alch for magic training and profit with real-time GE prices.",
};

export const revalidate = 3600; // Revalidate hourly (prices don't need to be super fresh for alch lookup, but good to have)

export default async function AlchemyPage() {
    return (
        <div>
            <AlchemyCalculator />
        </div>
    );
}
