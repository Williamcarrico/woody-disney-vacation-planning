import React from "react";
import type { Metadata } from "next";
import { Inter, Cinzel, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Particles } from "@/components/magicui/particles";
import { GlobalStyles } from "@/components/global-styles";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "WaltWise - Revolutionary Disney World Vacation Planning",
  description: "The most advanced Walt Disney World vacation planning tool. Optimize your magical vacation with intelligent planning, real-time updates, and seamless party communication.",
  keywords: "Disney World, vacation planning, Walt Disney World, Disney trips, vacation optimizer, Disney planner",
  authors: [{ name: "WaltWise Team" }],
  creator: "WaltWise",
  publisher: "WaltWise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://waltwise.com'),
  openGraph: {
    title: "WaltWise - Revolutionary Disney World Vacation Planning",
    description: "The most advanced Walt Disney World vacation planning tool with intelligent optimization and real-time features.",
    url: 'https://waltwise.com',
    siteName: 'WaltWise',
    images: [
      {
        url: '/images/disney/walt-wise-og.jpg',
        width: 1200,
        height: 630,
        alt: 'WaltWise - Disney World Vacation Planning',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "WaltWise - Revolutionary Disney World Vacation Planning",
    description: "The most advanced Walt Disney World vacation planning tool with intelligent optimization and real-time features.",
    images: ['/images/disney/walt-wise-twitter.jpg'],
    creator: '@WaltWise',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-blue-900 antialiased overflow-x-hidden",
          inter.variable,
          cinzel.variable,
          poppins.variable,
          "font-poppins"
        )}
      >
        <div className="relative min-h-screen">
          {/* Global Particle Background */}
          <Particles
            className="fixed inset-0 z-0 opacity-30"
            quantity={100}
            staticity={50}
            color="#ffffff"
            size={0.5}
            ease={50}
            refresh={false}
          />

          {/* Magical Grid Overlay */}
          <div className="fixed inset-0 z-10 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] bg-[length:100px_100px] animate-[shimmer_3s_ease-in-out_infinite]" />
          </div>

          {/* Main Content Container */}
          <div className="relative z-20">
            {children}
          </div>

          {/* Global Floating Elements */}
          <div className="fixed top-10 right-10 z-30 opacity-60">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
          </div>
          <div className="fixed top-32 right-32 z-30 opacity-40">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce shadow-lg shadow-pink-400/50" />
          </div>
          <div className="fixed top-64 right-16 z-30 opacity-50">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50 [animation-delay:1s]" />
          </div>
        </div>

        {/* Global Styles Component */}
        <GlobalStyles />
      </body>
    </html>
  );
}