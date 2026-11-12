import { useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'sunrise_landing_theme';

const THEME_META_COLORS = {
  light: '#EDF0EF',
  dark: '#0A1C24',
};

const readStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

let currentTheme = readStoredTheme();
const listeners = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const setLandingTheme = (nextTheme) => {
  const normalized = nextTheme === 'dark' ? 'dark' : 'light';
  if (normalized === currentTheme) return;
  currentTheme = normalized;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // Ignore storage write failures in private browsing
    }
  }
  emitChange();
};

const toggleLandingTheme = () => {
  setLandingTheme(currentTheme === 'dark' ? 'light' : 'dark');
};

const handleStorage = (event) => {
  if (event.key === null || event.key === STORAGE_KEY) {
    const next = readStoredTheme();
    if (next !== currentTheme) {
      currentTheme = next;
      emitChange();
    }
  }
};

const subscribe = (listener) => {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
};

const getSnapshot = () => currentTheme;
const getServerSnapshot = () => 'light';

export function useLandingTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return undefined;
    meta.setAttribute('content', THEME_META_COLORS[theme] || THEME_META_COLORS.light);
    return () => {
      meta.setAttribute('content', THEME_META_COLORS.light);
    };
  }, [theme]);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme: setLandingTheme,
    toggleTheme: toggleLandingTheme,
  };
}
