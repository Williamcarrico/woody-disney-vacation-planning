This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Google Maps Setup

This project uses Google Maps API with Advanced Markers. To set up:

1. Create a Google Cloud project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Maps JavaScript API
3. Create an API Key with appropriate restrictions
4. Create a Map ID:
   - Go to [Google Maps Platform](https://console.cloud.google.com/google/maps-apis/overview)
   - Navigate to "Map Management" in the menu
   - Click "Create Map ID"
   - Choose "Basic" map type and give it a name
   - Copy the generated Map ID

5. Set up environment variables in `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_api_key_here"
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID="your_map_id_here"
```

The Map ID is required for Advanced Markers to work correctly.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
