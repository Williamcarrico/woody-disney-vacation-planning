/**
 * @fileoverview Core utility functions for the Disney Vacation Planning application.
 * This module provides essential utility functions used throughout the application,
 * particularly for CSS class name manipulation and styling consistency.
 *
 * @module utils
 * @version 1.0.0
 * @author Disney Vacation Planning Team
 * @since 2024-01-01
 *
 * @requires clsx - For conditional class name composition
 * @requires tailwind-merge - For merging Tailwind CSS classes efficiently
 *
 * @example
 * // Basic usage of cn function
 * import { cn } from '@/lib/utils';
 *
 * const className = cn(
 *   'base-class',
 *   condition && 'conditional-class',
 *   { 'object-class': someBoolean }
 * );
 *
 * @see {@link https://github.com/lukeed/clsx} - clsx documentation
 * @see {@link https://github.com/dcastil/tailwind-merge} - tailwind-merge documentation
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges CSS class names intelligently using clsx and tailwind-merge.
 *
 * This utility function serves as the foundation for consistent styling across the
 * Disney Vacation Planning application. It combines the power of clsx for conditional
 * class composition with tailwind-merge for intelligent Tailwind CSS class merging,
 * preventing style conflicts and ensuring optimal CSS output.
 *
 * The function handles various input types including:
 * - String class names
 * - Conditional class objects
 * - Arrays of class names
 * - Boolean conditions
 * - Nested combinations of the above
 *
 * Tailwind-merge ensures that conflicting Tailwind classes are resolved properly.
 * For example, if both 'bg-red-500' and 'bg-blue-500' are provided, only the last
 * one will be applied, preventing CSS specificity issues.
 *
 * @function cn
 * @param {...ClassValue[]} inputs - Variable number of class name inputs to be processed.
 *   Each input can be:
 *   - string: Direct class name
 *   - object: Conditional classes where keys are class names and values are booleans
 *   - array: Array of any valid ClassValue types
 *   - boolean/null/undefined: Falsy values are ignored
 *
 * @returns {string} A string containing the merged and optimized class names.
 *   Returns an empty string if no valid classes are provided.
 *
 * @example
 * // Basic string concatenation
 * cn('btn', 'btn-primary')
 * // Returns: 'btn btn-primary'
 *
 * @example
 * // Conditional classes with boolean
 * cn('btn', isActive && 'btn-active', !isDisabled && 'btn-enabled')
 * // Returns: 'btn btn-active btn-enabled' (if both conditions are true)
 *
 * @example
 * // Object-based conditional classes
 * cn('btn', {
 *   'btn-primary': isPrimary,
 *   'btn-secondary': isSecondary,
 *   'btn-disabled': isDisabled
 * })
 * // Returns appropriate classes based on boolean values
 *
 * @example
 * // Array of classes
 * cn(['btn', 'hover:bg-blue-500'], isLarge ? ['text-lg', 'px-6'] : ['text-sm', 'px-4'])
 * // Returns merged classes with appropriate sizing
 *
 * @example
 * // Tailwind class conflict resolution
 * cn('bg-red-500 text-white', 'bg-blue-500')
 * // Returns: 'text-white bg-blue-500' (blue background wins, text-white preserved)
 *
 * @example
 * // Complex Disney-specific styling example
 * cn(
 *   'disney-card transition-all duration-300',
 *   {
 *     'disney-card--magic-kingdom': park === 'magic-kingdom',
 *     'disney-card--epcot': park === 'epcot',
 *     'disney-card--featured': isFeatured,
 *     'disney-card--disabled': isDisabled
 *   },
 *   isHovered && 'scale-105 shadow-xl',
 *   customClasses
 * )
 *
 * @since 1.0.0
 * @memberof module:utils
 *
 * @performance
 * This function is optimized for performance and can be called frequently in render cycles.
 * The underlying libraries (clsx and tailwind-merge) are highly optimized for speed.
 *
 * @accessibility
 * When using this function, ensure that dynamically added classes don't interfere
 * with accessibility features like focus indicators or screen reader utilities.
 *
 * @security
 * This function is safe for use with user input as it only processes class names.
 * However, ensure that class names themselves don't contain malicious content.
 *
 * @see {@link ClassValue} - Type definition for valid input values
 * @see {@link clsx} - Underlying conditional class composition utility
 * @see {@link twMerge} - Underlying Tailwind class merging utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
