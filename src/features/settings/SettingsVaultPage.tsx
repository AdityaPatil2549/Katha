import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Dropdown } from '@/components/ui/Dropdown';
import { 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Lock, 
  Heart,
  Palette,
  Moon,
  Sun,
  Monitor,
  Bell,
  Trash2,
  RefreshCw,
  Info,
  Check,
  AlertTriangle,
  HardDrive,
  Cloud,
  FileText,
  Code,
  User as UserIcon,
  Globe,
  Zap,
  Brain
} from 'lucide-react';
import { dbService } from '@/db/DatabaseService';
import { db } from '@/db/KathaDb';
import { googleCloudService } from '@/services/GoogleCloudService';
import { useGoogleLogin } from '@react-oauth/google';
import { useSettingsStore, type NotificationCategory, type NotificationChannel, type NotificationFrequency } from '@/store';
import { useToastStore } from '@/store/toastStore';
import {
  exportArchiveToPDF,
  exportArchiveToWord,
  triggerBlobDownload,
  type KathaArchiveExport,
} from '@/utils/exporters';
import type { Knowledge, Moment, Session, Story, TimelineEvent } from '@/types/models';

interface GoogleUser {
  access_token: string;
  name?: string;
  email?: string;
  picture?: string;
}

export default function SettingsVaultPage() {
  const [activeSection, setActiveSection] = useState<'appearance' | 'notifications' | 'privacy' | 'data' | 'backup' | 'about' | 'advanced' | 'cloud'>('appearance');
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    onSuccess: async (tokenResponse) => {
      await googleCloudService.initGapi();
      googleCloudService.setAccessToken(tokenResponse.access_token);
      
      // Fetch user profile info
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const data = await res.json();
        setUser({
          access_token: tokenResponse.access_token,
          name: data.name,
          email: data.email,
          picture: data.picture
        });
      } catch (e) {
        setUser({ access_token: tokenResponse.access_token });
      }
    },
    onError: () => {
      useToastStore.getState().addToast({ type: 'error', message: 'Google login failed. Please try again.' });
    }
  });
  const [pendingAction, setPendingAction] = useState<'clear-cache' | 'restore-cloud' | 'reset-app' | null>(null);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isRestoringFile, setIsRestoringFile] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const addToast = useToastStore((s) => s.addToast);
  const {
    theme, setTheme,
    accentColor, setAccentColor,
    disableCosmos, setDisableCosmos,
    notificationsEnabled, setNotificationsEnabled,
    globalMute, setGlobalMute,
    appLockEnabled, setAppLockEnabled,
    encryptionEnabled, setEncryptionEnabled,
    autoLockTime, setAutoLockTime,
    backupReminder, setBackupReminder,
    notificationPreferences, updateNotificationPreference
  } = useSettingsStore();
  const [showSaveToast, setShowSaveToast] = useState(false);

  const triggerSaveToast = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const [storageInfo, setStorageInfo] = useState({
    stories: 0,
    moments: 0,
    sessions: 0,
    knowledge: 0,
    total: 0,
    available: 0
  });

  const refreshStorageInfo = async () => {
    try {
      const usage = await dbService.getStorageUsage();
      let available = 0;
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        available = Math.round((estimate.quota || 0) / (1024 * 1024));
      }
      setStorageInfo({
        stories: usage.stories,
        moments: usage.moments,
        sessions: usage.sessions,
        knowledge: usage.knowledge,
        total: usage.total,
        available
      });
    } catch {
      addToast({ type: 'error', message: 'Unable to read storage metrics.' });
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('Katha', { body: 'Notifications enabled!' });
          addToast({ type: 'success', message: 'Browser notifications enabled.' });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            new Notification('Katha', { body: 'Notifications enabled!' });
            addToast({ type: 'success', message: 'Browser notifications enabled.' });
          } else {
            addToast({ type: 'warning', message: 'Notification permission was denied by your browser.' });
          }
        } else {
          addToast({ type: 'warning', message: 'Notifications are blocked in your browser settings.' });
        }
      } else {
        addToast({ type: 'info', message: 'Your browser does not support desktop notifications.' });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    refreshStorageInfo();
  }, []);

  const accentColors: { value: 'gold' | 'violet' | 'cyan' | 'rose' | 'emerald' | 'amber'; label: string; class: string }[] = [
    { value: 'gold', label: 'Burnished Gold', class: 'bg-accent-gold' },
    { value: 'violet', label: 'Wisdom Violet', class: 'bg-accent-violet' },
    { value: 'cyan', label: 'Memory Cyan', class: 'bg-accent-cyan' },
    { value: 'rose', label: 'Emotion Rose', class: 'bg-accent-rose' },
    { value: 'emerald', label: 'Growth Emerald', class: 'bg-accent-emerald' },
    { value: 'amber', label: 'Focus Amber', class: 'bg-accent-amber' }
  ];

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'cloud', label: 'Cloud & Auth', icon: <Cloud className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Storage', icon: <Database className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Export', icon: <Download className="w-4 h-4" /> },
    { id: 'about', label: 'About Katha', icon: <Info className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Code className="w-4 h-4" /> }
  ] as const;

  const buildArchivePayload = async (): Promise<KathaArchiveExport> => {
    const [stories, moments, sessions, knowledge, timeline] = await Promise.all([
      dbService.stories.findAll(),
      dbService.moments.findAll(),
      dbService.sessions.findAll(),
      dbService.knowledge.findAll(),
      dbService.timeline.findAll()
    ]);
    return {
      stories,
      moments,
      sessions,
      knowledge,
      timeline,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  };

  const handleExportStorybook = async () => {
    setIsExportingWord(true);
    try {
      const archive = await buildArchivePayload();
      const blob = await exportArchiveToWord(archive);
      triggerBlobDownload(blob, `katha-storybook-${new Date().toISOString().slice(0, 10)}.docx`);
      addToast({ type: 'success', message: 'Word storybook (.docx) exported.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to export Word storybook.' });
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleBackupData = async () => {
    try {
      const archive = await buildArchivePayload();
      const backup = {
        backupDate: archive.exportedAt,
        version: archive.version,
        data: {
          stories: archive.stories,
          moments: archive.moments,
          sessions: archive.sessions,
          knowledge: archive.knowledge,
          timeline: archive.timeline
        }
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      triggerBlobDownload(blob, `katha-backup-${new Date().toISOString().slice(0, 10)}.json`);
      addToast({ type: 'success', message: 'JSON backup downloaded.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to create JSON backup.' });
    }
  };

  const handleRestoreJSON = async (file: File) => {
    setIsRestoringFile(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        data?: {
          stories?: Story[];
          moments?: Moment[];
          sessions?: Session[];
          knowledge?: Knowledge[];
          timeline?: TimelineEvent[];
        };
        stories?: Story[];
        moments?: Moment[];
        sessions?: Session[];
        knowledge?: Knowledge[];
        timeline?: TimelineEvent[];
      };
      const payload = parsed.data ?? parsed;
      const stories = Array.isArray(payload.stories) ? payload.stories : [];
      const moments = Array.isArray(payload.moments) ? payload.moments : [];
      const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      const knowledge = Array.isArray(payload.knowledge) ? payload.knowledge : [];
      const timeline = Array.isArray(payload.timeline) ? payload.timeline : [];

      if (stories.length === 0 && moments.length === 0 && sessions.length === 0 && knowledge.length === 0) {
        addToast({ type: 'warning', message: 'Backup file contains no recognizable Katha records.' });
        return;
      }

      await db.transaction('rw', [db.stories, db.moments, db.sessions, db.knowledge, db.timeline], async () => {
        if (stories.length > 0) await db.stories.bulkPut(stories);
        if (moments.length > 0) await db.moments.bulkPut(moments);
        if (sessions.length > 0) await db.sessions.bulkPut(sessions);
        if (knowledge.length > 0) await db.knowledge.bulkPut(knowledge);
        if (timeline.length > 0) await db.timeline.bulkPut(timeline);
      });

      await refreshStorageInfo();
      addToast({ type: 'success', message: `Restored ${stories.length} stories and ${moments.length} moments.` });
    } catch {
      addToast({ type: 'error', message: 'Invalid backup file. Please select a valid Katha JSON backup.' });
    } finally {
      setIsRestoringFile(false);
    }
  };

  const executeClearCache = async () => {
    setIsClearingCache(true);
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(
          names
            .filter(name => !name.startsWith('workbox'))
            .map(name => caches.delete(name))
        );
      }
      await dbService.apiCache.clearExpired();
      await refreshStorageInfo();
      addToast({ type: 'success', message: 'Cache cleared successfully.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to clear cache.' });
    } finally {
      setIsClearingCache(false);
      setPendingAction(null);
    }
  };

  const executeResetApp = async () => {
    if (resetConfirmationInput.trim() !== 'DELETE MY DATA') {
      addToast({ type: 'warning', message: 'Type DELETE MY DATA exactly to confirm reset.' });
      return;
    }
    try {
      await dbService.clearAll();
      localStorage.clear();
      setPendingAction(null);
      setResetConfirmationInput('');
      addToast({ type: 'success', message: 'All local data cleared. Reloading...' });
      setTimeout(() => window.location.reload(), 800);
    } catch {
      addToast({ type: 'error', message: 'Failed to reset the app. Please try again.' });
    }
  };

  const handlePruneMetadataCache = async () => {
    setIsClearingCache(true);
    try {
      await dbService.apiCache.clearExpired();
      await refreshStorageInfo();
      addToast({ type: 'success', message: 'Expired metadata cache entries cleaned.' });
    } catch {
      addToast({ type: 'error', message: 'Could not clean expired cache.' });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handlePrintPDF = async () => {
    setIsExportingPDF(true);
    try {
      const archive = await buildArchivePayload();
      const blob = exportArchiveToPDF(archive);
      triggerBlobDownload(blob, `katha-storybook-${new Date().toISOString().slice(0, 10)}.pdf`);
      addToast({ type: 'success', message: 'PDF storybook exported.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to export PDF storybook.' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleLegacyArchive = async () => {
    try {
      const archive = await buildArchivePayload();
      const backup = {
        backupDate: archive.exportedAt,
        version: archive.version,
        data: {
          stories: archive.stories,
          moments: archive.moments,
          sessions: archive.sessions,
          knowledge: archive.knowledge,
          timeline: archive.timeline
        }
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      triggerBlobDownload(blob, `katha-legacy-archive-${new Date().toISOString().slice(0, 10)}.json`);
      addToast({ type: 'success', message: 'Legacy archive downloaded.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to create legacy archive.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-midnight">
      <div className="max-w-7xl mx-auto px-4 py-page">
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="text-center mb-page">
          <h1 className="heading-1 text-gradient-violet mb-tight">
            Settings &amp; Control
          </h1>
          <p className="text-h3 text-quote mb-section">
            Your personal vault
          </p>
          <p className="text-secondary">
            Manage your Katha experience, privacy, and data with complete control.
          </p>
        </div>
        </BlurReveal>

        <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-page">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="surface-elevated rounded-card p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full p-3 rounded-card transition-all duration-fast flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-accent-primary text-white'
                        : 'text-text-secondary hover:bg-midnight-surface hover:text-primary'
                    }`}
                  >
                    {section.icon}
                    <span className="text-small font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                
                {/* Appearance Settings */}
                {activeSection === 'appearance' && (
                  <div className="space-y-page">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Palette className="w-5 h-5 text-accent-primary" />
                      Appearance
                    </h2>

                    {/* Theme Selection */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Theme</h3>
                      <div className="grid grid-cols-3 gap-normal">
                        {[
                          { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
                          { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
                          { value: 'auto', label: 'Auto', icon: <Monitor className="w-5 h-5" /> }
                        ].map((themeOption) => (
                          <button
                            key={themeOption.value}
                            onClick={() => setTheme(themeOption.value as 'dark' | 'light' | 'auto')}
                            className={`p-4 rounded-card border-2 transition-all duration-fast ${
                              theme === themeOption.value
                                ? 'border-accent-primary bg-accent-primary/10'
                                : 'border-midnight-border hover:border-midnight-divider'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              {themeOption.icon}
                              <span className="text-small font-medium">{themeOption.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Accent Color</h3>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-normal">
                        {accentColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setAccentColor(color.value)}
                            className={`p-4 rounded-card border-2 transition-all duration-fast ${
                              accentColor === color.value
                                ? 'border-text-primary scale-105'
                                : 'border-transparent hover:border-midnight-divider'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${color.class}`} />
                              <span className="text-small text-secondary">{color.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3D WebGL Particle Cosmos Toggle */}
                    <div className="surface-elevated p-6 rounded-card flex items-center justify-between gap-4">
                      <div>
                        <h3 className="heading-3 text-primary mb-1">3D Celestial Cosmos</h3>
                        <p className="text-small text-secondary">
                          Render dynamic WebGL particle starfield in the background. Disable to conserve battery and reduce motion.
                        </p>
                      </div>
                      <div className="flex items-center justify-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setDisableCosmos(!disableCosmos);
                            triggerSaveToast();
                          }}
                          className={`w-16 h-11 min-h-[44px] flex items-center rounded-full p-1.5 transition-colors duration-fast ${
                            !disableCosmos ? 'bg-accent-gold' : 'bg-midnight-divider'
                          }`}
                          aria-label="Toggle 3D Celestial Cosmos"
                        >
                          <div
                            className={`bg-midnight-bg w-8 h-8 rounded-full shadow-md transform transition-transform duration-fast ${
                              !disableCosmos ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* Notifications Settings */}
                {activeSection === 'notifications' && (
                  <div className="space-y-page relative">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Bell className="w-5 h-5 text-accent-primary" />
                      Notifications
                    </h2>
                    
                    <AnimatePresence>
                      {showSaveToast && (
                        <motion.div 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="absolute top-0 right-0 bg-accent-emerald text-white px-4 py-2 rounded-full flex items-center gap-2 text-small font-medium shadow-glow-emerald z-10"
                        >
                          <Check className="w-4 h-4" />
                          Saved
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Global Mute */}
                    <div className="surface-elevated p-6 rounded-card space-y-4 border-l-4 border-accent-rose">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-primary">Global Mute</div>
                          <div className="text-small text-secondary">
                            Temporarily silence all notifications across all channels.
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setGlobalMute(!globalMute);
                            triggerSaveToast();
                          }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            globalMute ? 'bg-accent-rose' : 'bg-midnight-border'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            globalMute ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6 opacity-100 transition-opacity" style={{ opacity: globalMute ? 0.5 : 1, pointerEvents: globalMute ? 'none' : 'auto' }}>
                      {([
                        { id: 'activity', label: 'Story & Session Reminders', desc: 'Updates on your stories, moments, and watch sessions' },
                        { id: 'mentions', label: 'Journal & Insights', desc: 'Reflection prompts and saved quote resurfaces' },
                        { id: 'security', label: 'Vault & Sync Alerts', desc: 'Backup health and optional cloud sync status' }
                      ] as const satisfies ReadonlyArray<{ id: NotificationCategory; label: string; desc: string }>).map(cat => {
                        const prefs = notificationPreferences[cat.id];
                        return (
                          <div key={cat.id} className="surface-elevated p-6 rounded-card space-y-4">
                            <div>
                              <h3 className="heading-3 text-primary">{cat.label}</h3>
                              <p className="text-small text-secondary">{cat.desc}</p>
                            </div>

                            <div className="pt-4 border-t border-midnight-divider grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Channels */}
                              <div className="space-y-3">
                                <span className="text-xs uppercase tracking-wider text-secondary font-medium">Delivery Channels</span>
                                {(['inApp', 'email', 'push', 'sms'] as const satisfies ReadonlyArray<NotificationChannel>).map(channel => {
                                  const isEnabled = prefs.channels[channel];
                                  return (
                                    <div key={channel} className="flex items-center justify-between">
                                      <span className="text-small capitalize text-primary">
                                        {channel === 'inApp' ? 'In-App' : channel}
                                      </span>
                                      <button
                                        onClick={() => {
                                          updateNotificationPreference(cat.id, {
                                            channels: {
                                              ...prefs.channels,
                                              [channel]: !isEnabled
                                            }
                                          });
                                          triggerSaveToast();
                                        }}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${
                                          isEnabled ? 'bg-accent-primary' : 'bg-midnight-border'
                                        }`}
                                      >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${
                                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Frequency */}
                              {cat.id === 'activity' && (
                                <div className="space-y-3">
                                  <span className="text-xs uppercase tracking-wider text-secondary font-medium">Frequency</span>
                                  <Dropdown
                                    value={prefs.frequency || 'immediate'}
                                    onChange={(val) => {
                                      updateNotificationPreference(cat.id, { frequency: val as NotificationFrequency });
                                      triggerSaveToast();
                                    }}
                                    options={[
                                      { value: 'immediate', label: 'Immediately' },
                                      { value: 'daily', label: 'Daily Digest' },
                                      { value: 'weekly', label: 'Weekly Summary' }
                                    ]}
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cloud & Auth */}
                {activeSection === 'cloud' && (
                  <div className="space-y-page">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Cloud className="w-5 h-5 text-accent-gold" />
                      Cloud & Auth
                    </h2>

                    <div className="surface-elevated p-6 rounded-card border-l-4 border-accent-gold">
                      <div className="flex items-center gap-tight mb-3">
                        <Check className="w-5 h-5 text-accent-gold" />
                        <h3 className="heading-3 text-primary">Google Drive AppData Sync</h3>
                      </div>
                      <p className="text-secondary leading-relaxed mb-6">
                        Securely backup and restore your entire Katha universe using a hidden, dedicated folder in your Google Drive. 
                        Your data stays completely private and owned by you.
                      </p>

                      {user ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 bg-midnight-surface p-4 rounded-xl border border-midnight-border">
                            {user.picture ? (
                              <img src={user.picture} alt="Profile" className="w-12 h-12 rounded-full border border-midnight-divider" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-accent-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-primary">{user.name || 'Google User'}</h4>
                              <p className="text-small text-secondary">{user.email}</p>
                            </div>
                            <button 
                              onClick={() => setUser(null)}
                              className="btn btn-secondary py-2"
                            >
                              Sign Out
                            </button>
                          </div>

                          <div className="flex gap-4 mt-6">
                            <button 
                              onClick={async () => {
                                setIsSyncing(true);
                                try {
                                  await googleCloudService.backupToCloud();
                                  addToast({ type: 'success', message: 'Successfully backed up to Google Drive!' });
                                } catch (error: unknown) {
                                  addToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to backup to Drive. Please check your connection.' });
                                } finally {
                                  setIsSyncing(false);
                                }
                              }}
                              disabled={isSyncing}
                              className="btn btn-primary flex-1 py-3 disabled:opacity-50"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isSyncing ? 'Syncing...' : 'Backup to Cloud'}
                            </button>

                            <button 
                              onClick={() => setPendingAction('restore-cloud')}
                              disabled={isSyncing}
                              className="btn btn-secondary flex-1 py-3 disabled:opacity-50"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {isSyncing ? 'Restoring...' : 'Restore from Cloud'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => login()}
                          className="btn btn-primary py-3 w-full sm:w-auto px-8"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Sign in with Google
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Privacy & Security */}
                {activeSection === 'privacy' && (
                  <div className="space-y-page">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Shield className="w-5 h-5 text-accent-rose" />
                      Privacy & Security
                    </h2>

                    {/* Privacy Notice */}
                    <div className="surface-elevated p-6 rounded-card border-l-4 border-accent-emerald">
                      <div className="flex items-center gap-tight mb-3">
                        <Check className="w-5 h-5 text-accent-emerald" />
                        <h3 className="heading-3 text-primary">Privacy-First by Design</h3>
                      </div>
                      <p className="text-secondary leading-relaxed mb-4">
                        Katha stores your stories, moments, and reflections locally on this device by default. Cloud backup (Google Drive or Firebase sync) is completely optional and only runs when you choose to sign in and connect.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-normal text-small text-secondary">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>No third-party analytics or ads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>Optional end-user cloud sync</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>No data collection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>Offline-first architecture</span>
                        </div>
                      </div>
                    </div>

                    {/* App Lock */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">App Lock</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-primary">Enable App Lock</div>
                            <div className="text-small text-secondary">
                              Require authentication to access Katha
                            </div>
                          </div>
                          <button
                            onClick={() => setAppLockEnabled(!appLockEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              appLockEnabled ? 'bg-accent-emerald' : 'bg-midnight-border'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              appLockEnabled ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        {appLockEnabled && (
                          <div className="space-y-4 pl-4 border-l-2 border-midnight-divider">
                            <div>
                              <label className="block text-small font-medium text-secondary mb-2">
                                Auto-lock after inactivity
                              </label>
                              <Dropdown
                                value={autoLockTime}
                                onChange={setAutoLockTime}
                                options={[
                                  { value: '5', label: '5 minutes' },
                                  { value: '15', label: '15 minutes' },
                                  { value: '30', label: '30 minutes' },
                                  { value: '60', label: '1 hour' },
                                  { value: 'never', label: 'Never' }
                                ]}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Encryption */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Data Encryption</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-primary">Enable AES Encryption</div>
                            <div className="text-small text-secondary">
                              Encrypt your data with a password. Warning: If you forget your password, your data will be lost forever.
                            </div>
                          </div>
                          <button
                            onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              encryptionEnabled ? 'bg-accent-emerald' : 'bg-midnight-border'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              encryptionEnabled ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        {encryptionEnabled && (
                          <div className="p-4 bg-accent-amber/10 border border-accent-amber/30 rounded-card">
                            <div className="flex items-center gap-2 text-accent-amber mb-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium">Important</span>
                            </div>
                            <p className="text-small text-secondary">
                              Store your encryption password safely. Without it, your data cannot be recovered.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Data & Storage */}
                {activeSection === 'data' && (
                  <div className="space-y-page">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Database className="w-5 h-5 text-accent-gold" />
                      Data & Storage
                    </h2>

                    {/* Storage Usage */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Storage Usage</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-small">
                          <span className="text-secondary">Stories</span>
                          <span className="text-primary">{storageInfo.stories} items</span>
                        </div>
                        <div className="w-full bg-midnight-border rounded-full h-2">
                          <div 
                            className="bg-accent-primary h-full rounded-full"
                            style={{ width: `${storageInfo.total > 0 ? (storageInfo.stories / storageInfo.total) * 100 : 0}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-small">
                          <span className="text-secondary">Moments</span>
                          <span className="text-primary">{storageInfo.moments} items</span>
                        </div>
                        <div className="w-full bg-midnight-border rounded-full h-2">
                          <div 
                            className="bg-accent-rose h-full rounded-full"
                            style={{ width: `${storageInfo.total > 0 ? (storageInfo.moments / storageInfo.total) * 100 : 0}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-small">
                          <span className="text-secondary">Sessions</span>
                          <span className="text-primary">{storageInfo.sessions} items</span>
                        </div>
                        <div className="w-full bg-midnight-border rounded-full h-2">
                          <div 
                            className="bg-accent-emerald h-full rounded-full"
                            style={{ width: `${storageInfo.total > 0 ? (storageInfo.sessions / storageInfo.total) * 100 : 0}%` }}
                          />

                        </div>

                        <div className="flex justify-between text-small">
                          <span className="text-secondary">Knowledge</span>
                          <span className="text-primary">{storageInfo.knowledge} items</span>
                        </div>
                        <div className="w-full bg-midnight-border rounded-full h-2">
                          <div 
                            className="bg-accent-gold h-full rounded-full"
                            style={{ width: `${storageInfo.total > 0 ? (storageInfo.knowledge / storageInfo.total) * 100 : 0}%` }}
                          />
                        </div>

                        <div className="pt-4 border-t border-midnight-border">
                          <div className="flex justify-between font-medium">
                            <span className="text-primary">Total Records</span>
                            <span className="text-primary">{storageInfo.total} items</span>
                          </div>
                          {storageInfo.available > 0 && (
                            <div className="flex justify-between text-small text-secondary mt-1">
                              <span>Estimated Storage Available</span>
                              <span>{storageInfo.available} MB</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Storage Actions */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Storage Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-normal">
                        <button
                          onClick={() => setPendingAction('clear-cache')}
                          disabled={isClearingCache}
                          className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Clear Cache
                        </button>
                        <button 
                          id="optimizeBtn"
                          onClick={handlePruneMetadataCache}
                          disabled={isClearingCache}
                          className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
                        >
                          <HardDrive className="w-4 h-4" />
                          Prune Expired Cache
                        </button>
                      </div>
                    </div>

                    {/* Backup Reminder */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Backup Health</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-primary">Backup Reminders</div>
                          <div className="text-small text-secondary">
                            Get reminded to create regular backups of your data
                          </div>
                        </div>
                        <button
                          onClick={() => setBackupReminder(!backupReminder)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            backupReminder ? 'bg-accent-emerald' : 'bg-midnight-border'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            backupReminder ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup & Export */}
                {activeSection === 'backup' && (
                  <div className="space-y-page">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Download className="w-5 h-5 text-accent-emerald" />
                      Backup & Export
                    </h2>

                    {/* Storybook Export */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Create Your Storybook</h3>
                      <p className="text-secondary">
                        Turn your journey into a beautifully formatted storybook that you can keep forever.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-normal">
                        <button
                          onClick={handleExportStorybook}
                          disabled={isExportingWord}
                          className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                          <FileText className="w-4 h-4" />
                          {isExportingWord ? 'Building Word...' : 'Word Book (.docx)'}
                        </button>
                        <button 
                          onClick={handlePrintPDF}
                          disabled={isExportingPDF}
                          className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
                        >
                          <FileText className="w-4 h-4" />
                          {isExportingPDF ? 'Building PDF...' : 'PDF Book (.pdf)'}
                        </button>
                        <button 
                          onClick={handleBackupData}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <Database className="w-4 h-4" />
                          JSON Backup
                        </button>
                      </div>
                    </div>

                    {/* Memory Archive */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Memory Archive Backup & Restore</h3>
                      <p className="text-secondary">
                        Create a complete backup of all your memories, moments, and personal reflections, or restore from an exported JSON archive.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleBackupData}
                          className="btn btn-primary flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Create Memory Archive
                        </button>
                        <input
                          ref={restoreInputRef}
                          type="file"
                          accept="application/json,.json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              void handleRestoreJSON(file);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => restoreInputRef.current?.click()}
                          disabled={isRestoringFile}
                          className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4" />
                          {isRestoringFile ? 'Restoring...' : 'Restore from JSON'}
                        </button>
                      </div>
                    </div>

                    {/* Legacy Mode */}
                    <div className="surface-elevated p-6 rounded-card space-y-4 border-l-4 border-accent-amber">
                      <h3 className="heading-3 text-primary flex items-center gap-tight">
                        <Heart className="w-5 h-5 text-accent-amber" />
                        Personal Legacy Mode
                      </h3>
                      <p className="text-secondary">
                        Prepare your life archive for the future. This creates a comprehensive export of your entire 
                        Katha journey, perfect for preserving your story for generations to come.
                      </p>
                      <button 
                        onClick={handleLegacyArchive}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Generate Legacy Archive
                      </button>
                    </div>
                  </div>
                )}

                {/* About */}
                {activeSection === 'about' && (
                  <div className="space-y-page">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Info className="w-5 h-5 text-accent-primary" />
                      About Katha
                    </h2>

                    {/* App Info */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-violet rounded-2xl flex items-center justify-center">
                          <span className="text-3xl font-bold text-text-primary">K</span>
                        </div>
                        <div>
                          <h3 className="heading-2 text-primary">Katha</h3>
                          <p className="text-accent-gold font-medium">Powered by Smriti</p>
                        </div>
                        <p className="text-secondary max-w-md mx-auto">
                          Your personal story tracker powered by Smriti — a memory engine for your entertainment life. 
                          Every movie, every series, every experience. Stored locally. Protected forever.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-normal text-small">
                        <div>
                          <span className="text-secondary">Version:</span>
                          <span className="text-primary ml-2">v1.0.0</span>
                        </div>
                        <div>
                          <span className="text-secondary">Build Date:</span>
                          <span className="text-primary ml-2">January 12, 2026</span>
                        </div>
                      </div>
                    </div>

                    {/* Philosophy */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary flex items-center gap-tight">
                        <Brain className="w-5 h-5 text-accent-primary" />
                        Our Philosophy
                      </h3>
                      <div className="space-y-3 text-secondary">
                        <p>
                          Katha is built on the belief that stories shape who we are. Every film we watch, every series we follow, 
                          every moment that moves us — these are not just entertainment, they're chapters in our personal story.
                        </p>
                        <p>
                          We believe in local-first computing, data ownership, and the right to privacy. Your memories belong to you, 
                          not to corporations or cloud services.
                        </p>
                        <p>
                          Smriti, our memory engine, helps you see patterns, remember moments, and extract wisdom from your 
                          entertainment journey. It's not about tracking what you watch — it's about understanding who you're becoming.
                        </p>
                      </div>
                    </div>

                    {/* Privacy Promise */}
                    <div className="surface-elevated p-6 rounded-card border-l-4 border-accent-emerald">
                      <h3 className="heading-3 text-primary mb-4">Privacy Promise</h3>
                      <div className="space-y-2 text-small text-secondary">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>All data stored locally on your device</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>No analytics, tracking, or telemetry</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>No cloud synchronization required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>Optional encryption for sensitive data</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>Open source and auditable</span>
                        </div>
                      </div>
                    </div>

                    {/* Credits */}
                    <div className="surface-elevated p-6 rounded-card">
                      <h3 className="heading-3 text-primary mb-4">Credits & License</h3>
                      <div className="space-y-2 text-small text-secondary">
                        <p>Built with ❤️ for personal memory preservation</p>
                        <p>License: Personal Use Only</p>
                        <p>© 2026 Katha — Powered by Smriti</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced */}
                {activeSection === 'advanced' && (
                  <div className="space-y-page">
                    <h2 className="heading-2 text-primary flex items-center gap-tight">
                      <Code className="w-5 h-5 text-accent-amber" />
                      Advanced Settings
                    </h2>

                    {/* Developer Mode */}
                    <div className="surface-elevated p-6 rounded-card space-y-4">
                      <h3 className="heading-3 text-primary">Vault Diagnostics</h3>
                      <p className="text-secondary">
                        Local maintenance and raw archive export tools.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-normal">
                        <button 
                          onClick={handlePruneMetadataCache}
                          disabled={isClearingCache}
                          className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
                        >
                          <Database className="w-4 h-4" />
                          Prune Expired API Cache
                        </button>
                        <button 
                          onClick={handleBackupData}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Export Raw JSON Archive
                        </button>
                      </div>
                    </div>

                    {/* Dangerous Zone */}
                    <div className="surface-elevated p-6 rounded-card border-l-4 border-accent-rose space-y-4">
                      <h3 className="heading-3 text-accent-rose flex items-center gap-tight">
                        <AlertTriangle className="w-5 h-5" />
                        Dangerous Zone
                      </h3>
                      <p className="text-secondary">
                        These actions cannot be undone. Please be careful.
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setResetConfirmationInput('');
                            setPendingAction('reset-app');
                          }}
                          className="btn btn-secondary text-accent-rose border-accent-rose hover:bg-accent-rose/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Reset App (Delete All Data)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </FadeIn>
        </StaggerContainer>
      </div>

      {/* Confirmation Modal */}
      {pendingAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vault-confirm-title"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPendingAction(null)}
        >
          <div
            className="surface-elevated border border-midnight-border rounded-card max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="vault-confirm-title" className="heading-3 text-primary">
              {pendingAction === 'clear-cache' && 'Clear Cached Data?'}
              {pendingAction === 'restore-cloud' && 'Restore from Google Drive?'}
              {pendingAction === 'reset-app' && 'Reset Entire Local Vault?'}
            </h3>
            <p className="text-small text-secondary">
              {pendingAction === 'clear-cache' && 'This removes offline static caches and expired metadata entries. Your saved stories and notes remain untouched.'}
              {pendingAction === 'restore-cloud' && 'Restoring from Google Drive will overwrite unsaved local entries with your latest Drive snapshot.'}
              {pendingAction === 'reset-app' && 'This permanently deletes all stories, moments, sessions, and insights stored in this browser. Type DELETE MY DATA to confirm.'}
            </p>
            {pendingAction === 'reset-app' && (
              <input
                type="text"
                value={resetConfirmationInput}
                onChange={(e) => setResetConfirmationInput(e.target.value)}
                placeholder="Type DELETE MY DATA"
                className="w-full px-3 py-2 rounded-button bg-midnight-bg border border-midnight-border text-primary"
              />
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPendingAction(null)} className="btn btn-secondary">
                Cancel
              </button>
              {pendingAction === 'clear-cache' && (
                <button type="button" onClick={() => void executeClearCache()} className="btn btn-primary">
                  Clear Cache
                </button>
              )}
              {pendingAction === 'restore-cloud' && (
                <button
                  type="button"
                  onClick={async () => {
                    setPendingAction(null);
                    setIsSyncing(true);
                    try {
                      await googleCloudService.restoreFromCloud();
                      addToast({ type: 'success', message: 'Successfully restored! Refreshing...' });
                      setTimeout(() => window.location.reload(), 1200);
                    } catch (error: unknown) {
                      addToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to restore from Drive.' });
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  className="btn btn-primary"
                >
                  Restore Now
                </button>
              )}
              {pendingAction === 'reset-app' && (
                <button
                  type="button"
                  disabled={resetConfirmationInput.trim() !== 'DELETE MY DATA'}
                  onClick={() => void executeResetApp()}
                  className="btn btn-secondary text-accent-rose border-accent-rose hover:bg-accent-rose/10 disabled:opacity-40"
                >
                  Delete Everything
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
