"use client";

import { useState, useEffect } from "react";

/**
 * Debounce hook — delays value updates until after a specified period of inactivity.
 * Useful for search inputs to avoid excessive API calls.
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
