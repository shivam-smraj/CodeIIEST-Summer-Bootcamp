import { useState, useEffect } from 'react';

/**
 * Debounce a value — delays updating the returned value until after
 * the specified delay has elapsed since the last change.
 *
 * Used for search inputs to avoid firing on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
