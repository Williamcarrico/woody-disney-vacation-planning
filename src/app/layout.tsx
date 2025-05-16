import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { AuthProviderWrapper } from '@/components/auth/AuthProvider';
import MapProvider from "@/providers/map-provider";
import { APP_FULL_NAME, APP_DESCRIPTION } from "@/lib/utils/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <AuthProviderWrapper>
          <MapProvider>
            <Navbar />
            <main className="min-h-screen pt-20">
              {children}
            </main>
            <Footer />
          </MapProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
