import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Disney Vacation Planning",
    description: "Get in touch with our team to help plan your perfect Disney vacation.",
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}