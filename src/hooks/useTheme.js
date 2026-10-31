import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sunrise_theme';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  });

  const [systemDark, setSystemDark] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setThemeState(e.newValue || 'dark');
      }
    };
    const handleThemeChange = () => {
      setThemeState(localStorage.getItem(STORAGE_KEY) || 'dark');
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    if (newTheme === 'system') {
      localStorage.setItem(STORAGE_KEY, 'system');
    } else {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
    const resolved = newTheme === 'system' ? (systemDark ? 'dark' : 'light') : newTheme;
    document.documentElement.setAttribute('data-theme', resolved);
    window.dispatchEvent(new Event('theme-change'));
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}

export default useTheme;

