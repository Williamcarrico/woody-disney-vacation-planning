import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Interactive Map | Disney Vacation Planning",
    description: "Explore Walt Disney World Resort with our interactive map.",
};

export default function MapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}