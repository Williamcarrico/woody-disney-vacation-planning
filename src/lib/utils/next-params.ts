/**
 * Utility functions for handling Next.js 15 route parameters
 * In Next.js 15, params are async and need to be awaited
 */

// Type definitions for Next.js 15 route parameters
export interface AsyncPageProps<T = Record<string, string>> {
  params: Promise<T>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface AsyncRouteContext<T = Record<string, string>> {
  params: Promise<T>;
}

/**
 * Helper function to safely resolve route parameters
 */
export async function resolveParams<T extends Record<string, string>>(
  params: Promise<T>
): Promise<T> {
  try {
    return await params;
  } catch (error) {
    console.error('Failed to resolve route parameters:', error);
    throw new Error('Invalid route parameters');
  }
}

/**
 * Helper function to safely resolve search parameters
 */
export async function resolveSearchParams(
  searchParams?: Promise<Record<string, string | string[] | undefined>>
): Promise<Record<string, string | string[] | undefined>> {
  try {
    return searchParams ? await searchParams : {};
  } catch (error) {
    console.error('Failed to resolve search parameters:', error);
    return {};
  }
}

/**
 * Type-safe parameter extraction for common route patterns
 */
export async function extractParam<T extends string>(
  params: Promise<Record<string, string>>,
  key: string
): Promise<T> {
  const resolvedParams = await resolveParams(params);
  const value = resolvedParams[key];
  
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing or invalid parameter: ${key}`);
  }
  
  return value as T;
}

/**
 * Safe parameter extraction with default fallback
 */
export async function extractParamWithDefault<T extends string>(
  params: Promise<Record<string, string>>,
  key: string,
  defaultValue: T
): Promise<T> {
  try {
    return await extractParam<T>(params, key);
  } catch {
    return defaultValue;
  }
}

/**
 * Extract multiple parameters at once
 */
export async function extractParams<T extends Record<string, string>>(
  params: Promise<Record<string, string>>,
  keys: (keyof T)[]
): Promise<T> {
  const resolvedParams = await resolveParams(params);
  const result = {} as T;
  
  for (const key of keys) {
    const value = resolvedParams[key as string];
    if (!value || typeof value !== 'string') {
      throw new Error(`Missing or invalid parameter: ${String(key)}`);
    }
    result[key] = value as T[keyof T];
  }
  
  return result;
}