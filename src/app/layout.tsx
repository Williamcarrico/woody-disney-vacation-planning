import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/shared/Footer";
import { Geist, Geist_Mono } from "next/font/google";
import { Luckiest_Guy, Cabin_Sketch } from "next/font/google";
// import { ViewportMeta } from "@/components/ViewportMeta";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { MapProvider } from "@/contexts/MapContext";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_FULL_NAME, APP_DESCRIPTION } from "@/lib/utils/constants";
import FuturisticNavbar from "@/components/shared/FuturisticNavbar";
import { Toaster } from "@/components/ui/toaster";

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
      <head>
        {/* Add worker module polyfill to prevent initialization errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Polyfill for worker module initialization errors
              if (typeof window !== 'undefined' && !window.Worker) {
                window.Worker = class Worker {
                  constructor() {
                    console.warn('Web Workers not supported, using fallback');
                  }
                  postMessage() {}
                  terminate() {}
                };
              }

              // Handle module initialization errors
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('Worker module') || e.message.includes('init did not return'))) {
                  console.warn('Worker module initialization error caught and suppressed');
                  e.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
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
            <AuthProvider>
              <MapProvider
                timeout={5000}
                showUserNotification={true}
                notificationDuration={8000}
                retryAttempts={2}
              >
                <FuturisticNavbar />
                <main className="min-h-screen pt-20">
                  {children}
                </main>
                <Footer />
                <Toaster />
              </MapProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
