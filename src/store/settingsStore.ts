import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'auto';
export type AccentColor = 'violet' | 'cyan' | 'rose' | 'emerald' | 'amber';

interface SettingsState {
  theme: Theme;
  accentColor: AccentColor;
  notificationsEnabled: boolean;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default theme is dark
      accentColor: 'violet', // Default accent is violet
      notificationsEnabled: false,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'katha-settings',
    }
  )
);
