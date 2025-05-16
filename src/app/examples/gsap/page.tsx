import GsapExample from '@/components/examples/GsapExample';

export default function GsapExamplePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-8">GSAP Animation Examples</h1>
            <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12">
                This page demonstrates how to use GSAP animations with Next.js and React.
                The animations are created using the useGSAP hook from @gsap/react.
            </p>

            <GsapExample />

            <div className="mt-16 text-center">
                <h2 className="text-xl font-bold mb-4">How It Works</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    The animations above are powered by GSAP (GreenSock Animation Platform).
                    We've centralized our GSAP configuration in src/lib/gsap/index.ts where
                    all plugins are registered and then exported for use throughout the application.
                </p>
            </div>
        </div>
    );
}