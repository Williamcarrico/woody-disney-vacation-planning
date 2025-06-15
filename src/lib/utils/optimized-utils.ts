/**
 * Optimized utility functions with performance improvements
 * Consolidates common utility patterns with memoization and caching
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Memoization utility
function memoize<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  getKey?: (...args: TArgs) => string
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>()
  
  return (...args: TArgs): TReturn => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Optimized className utility with memoization
export const cn = memoize((...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}, (...inputs) => inputs.map(i => String(i)).join('|'))

// Debounce utility with cleanup
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let result: ReturnType<T>

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) result = func.apply(this, args)
    }

    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) result = func.apply(this, args)
    
    return result
  } as T & { cancel: () => void }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle: boolean = false
  let lastResult: ReturnType<T>

  const throttled = function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
    return lastResult
  } as T & { cancel: () => void }

  throttled.cancel = () => {
    inThrottle = false
  }

  return throttled
}

// Optimized date formatting with memoization
const formatDateMemoized = memoize((
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = 'en-US'
) => {
  const dateObj = new Date(date)
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}, (date, options, locale) => `${date}-${JSON.stringify(options)}-${locale}`)

export { formatDateMemoized as formatDate }

// Currency formatting with memoization
const formatCurrencyMemoized = memoize((
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}, (amount, currency, locale) => `${amount}-${currency}-${locale}`)

export { formatCurrencyMemoized as formatCurrency }

// Deep clone utility with performance optimization
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === "object") {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

// Optimized object comparison
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return false
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return false
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}

// Array utilities with performance optimizations
export const arrayUtils = {
  // Optimized unique function
  unique: <T>(array: T[], keyFn?: (item: T) => any): T[] => {
    if (!keyFn) return [...new Set(array)]
    
    const seen = new Set()
    return array.filter(item => {
      const key = keyFn(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  },

  // Chunking with generator for memory efficiency
  *chunk<T>(array: T[], size: number): Generator<T[], void, unknown> {
    for (let i = 0; i < array.length; i += size) {
      yield array.slice(i, i + size)
    }
  },

  // Optimized groupBy
  groupBy: <T, K extends string | number | symbol>(
    array: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> => {
    return array.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {} as Record<K, T[]>)
  },

  // Partition array into two based on predicate
  partition: <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
    const truthy: T[] = []
    const falsy: T[] = []
    
    for (const item of array) {
      (predicate(item) ? truthy : falsy).push(item)
    }
    
    return [truthy, falsy]
  }
}

// String utilities
export const stringUtils = {
  // Optimized slugify
  slugify: memoize((text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }),

  // Truncate with ellipsis
  truncate: (text: string, length: number, suffix: string = '...'): string => {
    if (text.length <= length) return text
    return text.slice(0, length - suffix.length) + suffix
  },

  // Capitalize first letter of each word
  titleCase: memoize((text: string): string => {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }),

  // Remove HTML tags
  stripHtml: memoize((html: string): string => {
    return html.replace(/<[^>]*>/g, '')
  })
}

// Number utilities
export const numberUtils = {
  // Format large numbers
  formatLargeNumber: memoize((num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }),

  // Clamp number between min and max
  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max)
  },

  // Generate random number in range
  randomBetween: (min: number, max: number): number => {
    return Math.random() * (max - min) + min
  },

  // Round to specific decimal places
  roundTo: (num: number, decimals: number): number => {
    const factor = Math.pow(10, decimals)
    return Math.round(num * factor) / factor
  }
}

// URL utilities
export const urlUtils = {
  // Build query string from object
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    
    return searchParams.toString()
  },

  // Parse query string to object
  parseQueryString: (queryString: string): Record<string, string | string[]> => {
    const params = new URLSearchParams(queryString)
    const result: Record<string, string | string[]> = {}
    
    for (const [key, value] of params.entries()) {
      if (result[key]) {
        if (Array.isArray(result[key])) {
          (result[key] as string[]).push(value)
        } else {
          result[key] = [result[key] as string, value]
        }
      } else {
        result[key] = value
      }
    }
    
    return result
  }
}

// Local storage utilities with error handling
export const storageUtils = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      if (typeof window === 'undefined') return defaultValue || null
      
      const item = localStorage.getItem(key)
      if (!item) return defaultValue || null
      
      return JSON.parse(item)
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue || null
    }
  },

  set: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false
      
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
      return false
    }
  },

  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
      return false
    }
  }
}

// Performance utilities
export const performanceUtils = {
  // Measure function execution time
  measure: async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  },

  // Create a performance observer
  createObserver: (entryTypes: string[], callback: (entries: PerformanceObserverEntryList) => void) => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return null
    
    const observer = new PerformanceObserver(callback)
    observer.observe({ entryTypes })
    return observer
  }
}

// Error handling utilities
export const errorUtils = {
  // Safe JSON parse
  safeJsonParse: <T>(json: string, defaultValue?: T): T | null => {
    try {
      return JSON.parse(json)
    } catch {
      return defaultValue || null
    }
  },

  // Retry function with exponential backoff
  retry: async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxAttempts) break
        
        const delay = baseDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }
}

// Type guard utilities
export const typeGuards = {
  isString: (value: any): value is string => typeof value === 'string',
  isNumber: (value: any): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: any): value is boolean => typeof value === 'boolean',
  isObject: (value: any): value is object => value !== null && typeof value === 'object',
  isArray: (value: any): value is any[] => Array.isArray(value),
  isFunction: (value: any): value is Function => typeof value === 'function',
  isNull: (value: any): value is null => value === null,
  isUndefined: (value: any): value is undefined => value === undefined,
  isNullOrUndefined: (value: any): value is null | undefined => value == null
}

// Export all utilities as a single object for convenience
export const utils = {
  cn,
  debounce,
  throttle,
  formatDate,
  formatCurrency,
  deepClone,
  deepEqual,
  array: arrayUtils,
  string: stringUtils,
  number: numberUtils,
  url: urlUtils,
  storage: storageUtils,
  performance: performanceUtils,
  error: errorUtils,
  typeGuards,
  memoize
}