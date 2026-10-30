import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Help & Expression Guide",
    description: "How to use GE Flip: filters, custom columns, expressions and the GE tax function for finding OSRS Grand Exchange flips.",
    alternates: { canonical: "/help" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
