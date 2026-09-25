"use client";

import { useEffect, useState } from "react";

/**
 * Returns a "delayed" copy of `value` that only updates once the user has
 * stopped changing it for `delayMs`. Used so we don't call the API on every
 * keystroke in the search box - only once typing pauses.
 */
export default function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    // if `value` changes again before the timer fires, React cleans up
    // the previous timer here first - that's what makes this a debounce
    // instead of a plain delay.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
