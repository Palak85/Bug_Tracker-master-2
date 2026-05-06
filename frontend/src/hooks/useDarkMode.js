import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bugfinder-theme';

/**
 * useDarkMode — persists the user's theme preference in localStorage
 * and syncs the `data-theme="dark"` attribute on <html>.
 *
 * Returns [isDark, toggle] so any component can read and flip the theme.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Priority: stored pref → system preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return [isDark, toggle];
}
