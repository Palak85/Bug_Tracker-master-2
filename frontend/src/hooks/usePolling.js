import { useEffect, useRef } from 'react';

/**
 * usePolling — calls `callback` immediately on mount, then every `intervalMs`.
 * Clears the interval cleanly on unmount or when deps change.
 *
 * @param {Function} callback   - async-safe function to run on each tick
 * @param {number}   intervalMs - polling interval in ms (default 30 000)
 * @param {boolean}  enabled    - set false to pause polling (default true)
 */
export function usePolling(callback, intervalMs = 30_000, enabled = true) {
  const savedCallback = useRef(callback);

  // Always call the latest version of callback without resetting the interval
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Fire immediately on mount (not a polling tick)
    savedCallback.current(false);

    const id = setInterval(() => {
      // This is a polling tick
      savedCallback.current(true);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
