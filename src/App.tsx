import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { AppProviders } from '@/app/AppProviders';
import { useSettingsStore } from '@/store';
import { ToastContainer } from '@/components/ui/Toast';

export function App() {
  const { theme, accentColor } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode: typeof theme) => {
      const resolved =
        mode === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : mode;
      root.setAttribute('data-theme', resolved);
    };

    applyTheme(theme);
    root.setAttribute('data-accent', accentColor);

    if (theme !== 'auto') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('auto');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, accentColor]);

  return (
    <AppProviders>
      <RouterProvider router={router} />
      <ToastContainer />
    </AppProviders>
  );
}
