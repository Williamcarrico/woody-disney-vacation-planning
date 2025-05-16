/**
 * Formats a date in a human-readable format (Month Day, Year)
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

/**
 * Formats a date range as a string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
}

/**
 * Returns a relative time string (e.g., "in 3 days", "3 days ago")
 */
export function getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';

    if (diffInDays > 0) {
        if (diffInDays < 30) return `In ${diffInDays} days`;
        if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `In ${months} ${months === 1 ? 'month' : 'months'}`;
        }
        const years = Math.floor(diffInDays / 365);
        return `In ${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
        const absDiff = Math.abs(diffInDays);
        if (absDiff < 30) return `${absDiff} days ago`;
        if (absDiff < 365) {
            const months = Math.floor(absDiff / 30);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }
        const years = Math.floor(absDiff / 365);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: Date): boolean {
    return date < new Date();
}

/**
 * Checks if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
    return date > new Date();
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

/**
 * Checks if a date is between startDate and endDate (inclusive)
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
}

/**
 * Formats a date as YYYY-MM-DD
 */
export function formatYYYYMMDD(date: Date): string {
    return date.toISOString().split('T')[0];
}