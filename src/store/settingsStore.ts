import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'auto';
export type AccentColor = 'violet' | 'cyan' | 'rose' | 'emerald' | 'amber';

export type NotificationCategory = 'activity' | 'mentions' | 'billing' | 'security' | 'marketing';
export type NotificationChannel = 'inApp' | 'email' | 'push' | 'sms';
export type NotificationFrequency = 'immediate' | 'daily' | 'weekly';

export interface CategoryPreference {
  channels: Record<NotificationChannel, boolean>;
  frequency?: NotificationFrequency;
}

export type NotificationPreferences = Record<NotificationCategory, CategoryPreference>;

interface SettingsState {
  theme: Theme;
  accentColor: AccentColor;
  notificationsEnabled: boolean; // Keep for backward compatibility or basic browser permissions
  globalMute: boolean;
  notificationPreferences: NotificationPreferences;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setGlobalMute: (muted: boolean) => void;
  updateNotificationPreference: (
    category: NotificationCategory,
    updates: Partial<CategoryPreference>
  ) => void;
}

const defaultPreferences: NotificationPreferences = {
  activity: { channels: { inApp: true, email: true, push: false, sms: false }, frequency: 'immediate' },
  mentions: { channels: { inApp: true, email: true, push: true, sms: false }, frequency: 'immediate' },
  billing: { channels: { inApp: true, email: true, push: false, sms: false }, frequency: 'immediate' },
  security: { channels: { inApp: true, email: true, push: true, sms: true }, frequency: 'immediate' },
  marketing: { channels: { inApp: false, email: false, push: false, sms: false }, frequency: 'weekly' }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default theme is dark
      accentColor: 'violet', // Default accent is violet
      notificationsEnabled: false,
      globalMute: false,
      notificationPreferences: defaultPreferences,
      
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setGlobalMute: (globalMute) => set({ globalMute }),
      updateNotificationPreference: (category, updates) => 
        set((state) => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            [category]: {
              ...state.notificationPreferences[category],
              ...updates,
              channels: {
                ...state.notificationPreferences[category].channels,
                ...(updates.channels || {})
              }
            }
          }
        })),
    }),
    {
      name: 'katha-settings',
    }
  )
);
