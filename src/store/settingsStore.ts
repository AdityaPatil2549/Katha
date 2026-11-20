import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'auto';
export type AccentColor = 'gold' | 'violet' | 'cyan' | 'rose' | 'emerald' | 'amber';

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
  appLockEnabled: boolean;
  encryptionEnabled: boolean;
  autoLockTime: string;
  backupReminder: boolean;
  disableCosmos: boolean;
  notificationPreferences: NotificationPreferences;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setDisableCosmos: (disable: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setGlobalMute: (muted: boolean) => void;
  setAppLockEnabled: (enabled: boolean) => void;
  setEncryptionEnabled: (enabled: boolean) => void;
  setAutoLockTime: (minutes: string) => void;
  setBackupReminder: (enabled: boolean) => void;
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
      accentColor: 'gold', // Default luxury accent is burnished gold
      notificationsEnabled: false,
      globalMute: false,
      appLockEnabled: false,
      encryptionEnabled: false,
      autoLockTime: '30',
      backupReminder: true,
      disableCosmos: false,
      notificationPreferences: defaultPreferences,
      
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setDisableCosmos: (disableCosmos) => set({ disableCosmos }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setGlobalMute: (globalMute) => set({ globalMute }),
      setAppLockEnabled: (appLockEnabled) => set({ appLockEnabled }),
      setEncryptionEnabled: (encryptionEnabled) => set({ encryptionEnabled }),
      setAutoLockTime: (autoLockTime) => set({ autoLockTime }),
      setBackupReminder: (backupReminder) => set({ backupReminder }),
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
