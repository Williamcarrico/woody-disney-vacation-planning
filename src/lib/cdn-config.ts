/**
 * CDN configuration for static asset optimization
 */

/**
 * Configuration for image optimization and CDN delivery
 */
export const imageConfig = {
    // Defines sizes for responsive images
    sizes: {
        xs: 320,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
    },

    // Paths that should use optimized images
    optimizedPaths: [
        '/images',
        '/icons',
        '/public/images',
    ],

    // Default image quality (1-100)
    quality: 80,

    // Default image format
    format: 'webp',
}

/**
 * Get CDN URL for a given asset path
 *
 * @param path - Relative path to the asset
 * @returns Full CDN URL
 */
export function getCdnUrl(path: string): string {
    // Base CDN URL from environment variable
    const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || ''

    // If no CDN URL is configured, return the path as is
    if (!cdnBase) return path

    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    // Return the full CDN URL
    return `${cdnBase}${normalizedPath}`
}

/**
 * Generate optimized image URL with size and format parameters
 *
 * @param path - Path to the image
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
    path: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'webp' | 'avif' | 'jpg' | 'png';
    } = {}
): string {
    // Get base CDN URL
    const baseUrl = getCdnUrl(path)

    // If this is not a CDN URL, return the original path
    if (baseUrl === path) return path

    // Default options
    const width = options.width || 0
    const height = options.height || 0
    const quality = options.quality || imageConfig.quality
    const format = options.format || imageConfig.format

    // Construct the optimized URL with parameters
    // This assumes your CDN supports URL parameters for image optimization
    // Adjust the query parameters based on your CDN provider
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    params.append('q', quality.toString())
    params.append('fm', format)

    // Return the optimized URL
    return `${baseUrl}?${params.toString()}`
}