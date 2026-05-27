import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Merges Tailwind CSS classes safely, handling conflicts.
 * Always use this instead of template literals for conditional Tailwind classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date for display in session cards
 * Example: "Monday, June 15, 2026 • 7:00 PM"
 */
export function formatSessionDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "EEEE, MMMM d, yyyy '•' h:mm a");
}

/**
 * Returns relative time string
 * Example: "2 hours ago", "in 3 days"
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Formats a large number with commas (Indian locale)
 * Example: 12500 → "12,500"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

/**
 * Truncates a string to maxLength and adds ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Returns a plural-aware string
 * Example: pluralize(1, 'contest') → '1 contest'
 *          pluralize(3, 'contest') → '3 contests'
 */
export function pluralize(count: number, noun: string, suffix = 's'): string {
  return `${count} ${noun}${count !== 1 ? suffix : ''}`;
}

/**
 * Safely parses a JSON string, returning null on failure
 */
export function safeParseJSON<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

/**
 * Sleeps for the given number of milliseconds (used in CF API rate limiting)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
