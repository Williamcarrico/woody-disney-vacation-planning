/**
 * Input sanitization utilities to prevent injection attacks
 */

/**
 * Sanitizes a string input to prevent XSS and injection attacks
 * @param input The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    if (!input) return input

    // Replace potentially dangerous characters
    return input
        // Prevent HTML injection
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Prevent script injection
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        // Prevent SQL injection patterns
        .replace(/(\b)(union|select|insert|drop|delete|update|alter)(\b)/gi,
            (_, p1, p2, p3) => `${p1}filtered${p3}`)
        .replace(/--/g, '')
        .replace(/;/g, '&#59;')
}

/**
 * Sanitizes HTML content for safe rendering
 * More advanced than basic sanitizeInput
 * @param html HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
    if (!html) return html

    // Create a temporary DOM element to sanitize HTML
    const tempDiv = document.createElement('div')
    tempDiv.textContent = html // This escapes HTML

    return tempDiv.innerHTML
}

/**
 * Encodes URI components safely
 * @param value The value to encode
 * @returns Safely encoded URI component
 */
export function safeEncodeURIComponent(value: string): string {
    if (!value) return ''

    return encodeURIComponent(sanitizeInput(value))
}