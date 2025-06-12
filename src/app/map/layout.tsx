import { Metadata } from 'next';
import { GoogleMapsProvider } from '@/components/maps/google-maps-provider';
import { ReactQueryProvider } from "@/providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: 'Disney World Map | Explore Parks and Attractions',
    description: 'Interactive map of Walt Disney World parks, attractions, dining, and more. Plan your perfect Disney vacation with our detailed park maps.',
};

export default function MapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReactQueryProvider>
            <div className="h-[calc(100vh-65px)] w-full relative min-h-screen">
                <GoogleMapsProvider>
                    {children}
                </GoogleMapsProvider>
                <Toaster />
            </div>
        </ReactQueryProvider>
    );
}