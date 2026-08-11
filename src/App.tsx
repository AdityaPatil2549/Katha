import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { AppProviders } from '@/app/AppProviders';
import { SplashScreen } from '@/components/onboarding/SplashScreen';
import { UserOnboarding } from '@/features/onboarding/UserOnboarding';
import { useSettingsStore } from '@/store';

export function App() {
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('katha_onboarded'));
  const { theme, accentColor } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    // Auto theme calculation
    let currentTheme = theme;
    if (theme === 'auto') {
      currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', currentTheme);
    root.setAttribute('data-accent', accentColor);
  }, [theme, accentColor]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
