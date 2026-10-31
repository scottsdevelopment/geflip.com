import { Metadata } from "next";
import { notFound } from "next/navigation";
import ItemPageClient from "./ItemPageClient";
import { fetchAllMappings, fetchItemDataBySlug, getItemImageUrl } from "@/lib/api";
import { generateSlug } from "@/lib/slug";
import { afterTax } from "@/lib/geTax";

// Required for static export - generate paths for all items
export async function generateStaticParams() {
    const mappings = await fetchAllMappings();
    // Several items share a name (and therefore a slug); emit each slug once
    const slugs = new Set(mappings.map((item) => generateSlug(item.name)));
    return Array.from(slugs, (slug) => ({ slug }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const itemData = await fetchItemDataBySlug(slug);

    if (!itemData) {
        return {
            title: "Item Not Found",
            description: "The requested OSRS item could not be found.",
        };
    }

    const { mapping: item, price } = itemData;
    const buyPrice = price.high;
    const sellPrice = price.low;
    const hasPrices = buyPrice > 0 && sellPrice > 0;
    // Margin after GE tax, matching the table and item page
    const margin = hasPrices ? afterTax(buyPrice) - sellPrice : 0;
    const roi = hasPrices ? ((margin / sellPrice) * 100).toFixed(2) : "0";

    const title = `${item.name} - Live Price, Graph, Flipping Margin`;
    const description = hasPrices
        ? `Check the real-time OSRS GE price for ${item.name}. Buy: ${buyPrice.toLocaleString()} gp, sell: ${sellPrice.toLocaleString()} gp. Flipping margin after tax: ${margin.toLocaleString()} gp (${roi}%).`
        : `Check the real-time OSRS Grand Exchange price, price history graph and flipping margin for ${item.name}.`;
    const imageUrl = getItemImageUrl(item.name);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: imageUrl,
                    alt: `${item.name} Icon`,
                },
            ],
            url: `https://geflip.com/item/${slug}`,
        },
        twitter: {
            // Item icons are small and square, so the large-image card would be blurry
            card: "summary",
            title,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical: `https://geflip.com/item/${slug}`,
        },
    };
}

export default async function ItemPage({ params }: PageProps) {
    const { slug } = await params;
    const itemData = await fetchItemDataBySlug(slug);

    if (!itemData) {
        notFound();
    }

    const { mapping: item } = itemData;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: `${item.name} - OSRS Grand Exchange price`,
                        url: `https://geflip.com/item/${slug}`,
                        description: `Old School RuneScape Grand Exchange price and flipping data for ${item.name}`,
                        primaryImageOfPage: getItemImageUrl(item.name),
                        about: {
                            "@type": "Thing",
                            name: item.name,
                            description: item.examine,
                            image: getItemImageUrl(item.name),
                        },
                    }).replace(/</g, "\\u003c"), // keep "</script>" in data from closing the tag
                }}
            />
            <ItemPageClient slug={slug} />
        </>
    );
}
