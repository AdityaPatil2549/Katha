import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { AppProviders } from '@/app/AppProviders';
import { SplashScreen } from '@/components/onboarding/SplashScreen';
import { Cursor } from '@/components/ui/motion/Cursor';
import { useSettingsStore } from '@/store';

import { ToastContainer } from '@/components/ui/Toast';

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
      <Cursor
        attachToParent={false}
        variants={{
          initial: { scale: 0.5, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.5, opacity: 0 },
        }}
        springConfig={{ bounce: 0.001, mass: 0.1 }}
        transition={{
          ease: 'easeInOut',
          duration: 0.15,
        }}
        className="z-[9999]"
      >
        <div className="w-6 h-6 rounded-full border-2 border-accent-cyan/80 bg-accent-cyan/10 backdrop-blur-[2px] flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.5)]">
           <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
        </div>
      </Cursor>
      <RouterProvider router={router} />
      <ToastContainer />
    </AppProviders>
  );
}
