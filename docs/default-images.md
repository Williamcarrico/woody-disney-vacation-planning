# Default Images Guide

This document outlines the default fallback images available in the Disney vacation planning application.

## Overview

To ensure a consistent user experience, we provide high-quality default images that are displayed when specific content images are unavailable. These images are optimized in WebP format for best performance.

## Available Default Images

### 1. Restaurant Default
- **Path**: `/images/restaurants/default-restaurant.webp`
- **Usage**: Fallback for restaurant images
- **Dimensions**: 400x300px
- **Description**: Features an elegant plate with fork and knife, decorated with Disney-style stars

```typescript
// Usage example
const imageUrl = restaurant.imageUrl || "/images/restaurants/default-restaurant.webp"
```

### 2. Attraction Default
- **Path**: `/images/disney/default-attraction.webp`
- **Usage**: Fallback for attraction images
- **Dimensions**: 400x300px
- **Description**: Magical castle silhouette with sparkles and clouds

```typescript
// Usage example
const imageUrl = attraction.imageUrl || "/images/disney/default-attraction.webp"
```

### 3. Park Default
- **Path**: `/images/disney/default-park.webp`
- **Usage**: Fallback for park images
- **Dimensions**: 400x300px
- **Description**: Theme park scene with ferris wheel, roller coaster, and castle

```typescript
// Usage example
const imageUrl = park.imageUrl || "/images/disney/default-park.webp"
```

### 4. Event Default
- **Path**: `/images/disney/default-event.webp`
- **Usage**: Fallback for event images
- **Dimensions**: 400x300px
- **Description**: Nighttime fireworks celebration over castle silhouette

```typescript
// Usage example
const imageUrl = event.imageUrl || "/images/disney/default-event.webp"
```

## Implementation Guidelines

### React Components

When implementing image fallbacks in React components, use this pattern:

```tsx
import Image from 'next/image'

function RestaurantCard({ restaurant }) {
  return (
    <Image
      src={restaurant.imageUrl || "/images/restaurants/default-restaurant.webp"}
      alt={restaurant.name}
      width={400}
      height={300}
      className="object-cover rounded-lg"
    />
  )
}
```

### Utility Functions

For consistent fallback logic, consider creating utility functions:

```typescript
// src/lib/utils/image-fallbacks.ts
export function getRestaurantImageUrl(restaurant: any): string {
  return restaurant.imageUrl || "/images/restaurants/default-restaurant.webp"
}

export function getAttractionImageUrl(attraction: any): string {
  return attraction.imageUrl || "/images/disney/default-attraction.webp"
}

export function getParkImageUrl(park: any): string {
  return park.imageUrl || "/images/disney/default-park.webp"
}

export function getEventImageUrl(event: any): string {
  return event.imageUrl || "/images/disney/default-event.webp"
}
```

## Source Files

The default images are created from SVG sources and converted to WebP for optimal web performance:

- Source SVGs: `public/images/*/default-*.svg`
- Optimized WebP: `public/images/*/default-*.webp`
- Conversion script: `scripts/convert-default-images.js`

## Regenerating Images

To regenerate the WebP images from SVG sources:

```bash
npm run build:default-images
# or
node scripts/convert-default-images.js
```

## Design Principles

All default images follow these design principles:

1. **Disney Magic**: Incorporate Disney-style elements (stars, sparkles, castles)
2. **Professional Quality**: Clean, high-quality graphics suitable for production
3. **Accessibility**: Good contrast and clear visual hierarchy
4. **Performance**: Optimized WebP format with 85% quality
5. **Consistency**: Uniform 400x300px dimensions and similar visual style

## Browser Support

WebP images are supported in all modern browsers. For legacy browser support, consider implementing fallbacks:

```tsx
<picture>
  <source srcSet="/images/restaurants/default-restaurant.webp" type="image/webp" />
  <img src="/images/restaurants/default-restaurant.jpg" alt="Default restaurant" />
</picture>
```

## File Sizes

Optimized file sizes for efficient loading:

- Restaurant default: ~3KB
- Attraction default: ~5KB
- Park default: ~4KB
- Event default: ~6KB

These small file sizes ensure fast loading even on slower connections.