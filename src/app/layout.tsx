import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Luckiest_Guy, Cabin_Sketch } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { AuthProviderWrapper } from '@/components/auth/AuthProvider';
import MapProvider from "@/providers/map-provider";
import ReactQueryProvider from "@/providers/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_FULL_NAME, APP_DESCRIPTION } from "@/lib/utils/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fun, playful font for logo and headings
const luckiestGuy = Luckiest_Guy({
  weight: "400",
  variable: "--font-luckiest",
  subsets: ["latin"],
  display: "swap",
});

// Sketchy font for secondary headings
const cabinSketch = Cabin_Sketch({
  weight: "400",
  variable: "--font-cabin-sketch",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_FULL_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${luckiestGuy.variable} ${cabinSketch.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          defaultTheme="system"
          defaultDisneyTheme="dark"
          enableSystem
          attribute="class"
          storageKey="disney-vacation-theme"
        >
          <ReactQueryProvider>
            <AuthProviderWrapper>
              <MapProvider>
                <Navbar />
                <main className="min-h-screen pt-20">
                  {children}
                </main>
                <Footer />
              </MapProvider>
            </AuthProviderWrapper>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
