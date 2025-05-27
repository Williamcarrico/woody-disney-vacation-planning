export default function TestPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Test Page</h1>
            <p>If you can see this, the basic Next.js app is working.</p>
            <p>Firebase API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Loaded' : 'Missing'}</p>
            <p>Google Maps API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Loaded' : 'Missing'}</p>
        </div>
    );
}