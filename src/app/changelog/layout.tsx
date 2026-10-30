import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Changelog",
    description: "Latest updates and new features in GE Flip, the OSRS Grand Exchange flipping finder.",
    alternates: { canonical: "/changelog" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
