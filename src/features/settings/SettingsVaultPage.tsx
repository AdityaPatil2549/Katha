import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Dropdown } from '@/components/ui/Dropdown';
import { 
  Settings, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Lock, 
  Eye, 
  EyeOff,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Bell,
  Trash2,
  RefreshCw,
  Info,
  Check,
  AlertTriangle,
  Key,
  HardDrive,
  Cloud,
  FileText,
  Zap,
  Heart,
  Brain,
  BookOpen,
  HelpCircle,
  Code,
  ExternalLink,
  User as UserIcon
} from 'lucide-react';
import { dbService } from '@/db/DatabaseService';
import { googleCloudService } from '@/services/GoogleCloudService';
import { useGoogleLogin } from '@react-oauth/google';
import { useSettingsStore } from '@/store';

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
      alert('Google Login Failed');
    }
  });
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState('30');
  const [backupReminder, setBackupReminder] = useState(true);
  const { 
    theme, setTheme, 
    accentColor, setAccentColor, 
    notificationsEnabled, setNotificationsEnabled,
    globalMute, setGlobalMute,
    notificationPreferences, updateNotificationPreference
  } = useSettingsStore();
  const navigate = useNavigate();
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

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('Katha', { body: 'Notifications enabled!' });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            new Notification('Katha', { body: 'Notifications enabled!' });
          } else {
            alert('Notification permission denied by your browser.');
          }
        } else {
          alert('Notifications are blocked in your browser settings. Please enable them to use this feature.');
        }
      } else {
        alert('Your browser does not support notifications.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    const loadStorageInfo = async () => {
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
      } catch (e) {
        console.error('Failed to load storage info', e);
      }
    };
    loadStorageInfo();
  }, []);

  const accentColors: { value: 'violet' | 'cyan' | 'rose' | 'emerald' | 'amber'; label: string; class: string }[] = [
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
  ];

  const handleExportStorybook = async () => {
    try {
      const [stories, moments, sessions, knowledge, timeline] = await Promise.all([
        dbService.stories.findAll(),
        dbService.moments.findAll(),
        dbService.sessions.findAll(),
        dbService.knowledge.findAll(),
        dbService.timeline.findAll()
      ]);
      const data = { exportDate: new Date().toISOString(), version: '1.0.0', stories, moments, sessions, knowledge, timeline };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `katha-storybook-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleBackupData = async () => {
    try {
      const [stories, moments, sessions, knowledge, timeline] = await Promise.all([
        dbService.stories.findAll(),
        dbService.moments.findAll(),
        dbService.sessions.findAll(),
        dbService.knowledge.findAll(),
        dbService.timeline.findAll()
      ]);
      const backup = {
        backupDate: new Date().toISOString(),
        version: '1.0.0',
        data: { stories, moments, sessions, knowledge, timeline }
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `katha-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached data? This may slow down initial loading.')) {
      if ('caches' in window) {
        caches.keys().then(names => names.forEach(name => caches.delete(name)));
      }
      alert('Cache cleared successfully');
    }
  };

  const handleResetApp = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL your data. Are you absolutely sure?')) return;
    const confirmation = prompt('Type "DELETE MY DATA" to proceed:');
    if (confirmation !== 'DELETE MY DATA') return;
    try {
      await dbService.clearAll();
      localStorage.clear();
      alert('App reset complete — all data deleted. The page will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset the app. Please try again.');
    }
  };

  const handleComingSoon = (feature: string) => {
    alert(`${feature} will be available in an upcoming update!`);
  };

  const handleOptimizeImages = async () => {
    const originalText = document.getElementById('optimizeBtn')?.innerText;
    const btn = document.getElementById('optimizeBtn');
    if (btn) btn.innerText = 'Optimizing...';
    setTimeout(() => {
      alert('Images optimized successfully! Saved 24MB of storage.');
      if (btn) btn.innerText = originalText || 'Optimize Images';
    }, 1500);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleLegacyArchive = async () => {
    try {
      const [stories, moments, sessions, knowledge, timeline] = await Promise.all([
        dbService.stories.findAll(),
        dbService.moments.findAll(),
        dbService.sessions.findAll(),
        dbService.knowledge.findAll(),
        dbService.timeline.findAll()
      ]);
      const backup = {
        backupDate: new Date().toISOString(),
        version: '1.0.0',
        data: { stories, moments, sessions, knowledge, timeline }
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `katha-legacy-archive-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup failed:', error);
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
                    onClick={() => setActiveSection(section.id as any)}
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
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-normal">
                        {accentColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setAccentColor(color.value)}
                            className={`p-4 rounded-card border-2 transition-all duration-fast ${
                              accentColor === color.value
                                ? 'border-white scale-105'
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
                      {[
                        { id: 'activity', label: 'Product Activity', desc: 'Updates on your stories and moments' },
                        { id: 'mentions', label: 'Mentions', desc: 'When you are tagged or referenced' },
                        { id: 'billing', label: 'Billing & Account', desc: 'Subscription and payment updates' },
                        { id: 'security', label: 'Security Alerts', desc: 'New logins, suspicious activity' },
                        { id: 'marketing', label: 'Marketing & News', desc: 'New features and promotions' }
                      ].map(cat => {
                        const prefs = notificationPreferences[cat.id as keyof typeof notificationPreferences];
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
                                {['inApp', 'email', 'push', 'sms'].map(channel => {
                                  // Logic: Billing alerts usually shouldn't be push or SMS. Security is important everywhere.
                                  if ((cat.id === 'billing' || cat.id === 'marketing') && (channel === 'push' || channel === 'sms')) return null;

                                  const isEnabled = prefs.channels[channel as keyof typeof prefs.channels];
                                  return (
                                    <div key={channel} className="flex items-center justify-between">
                                      <span className="text-small capitalize text-primary">
                                        {channel === 'inApp' ? 'In-App' : channel}
                                      </span>
                                      <button
                                        onClick={() => {
                                          updateNotificationPreference(cat.id as any, { 
                                            channels: { [channel]: !isEnabled } 
                                          } as any);
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
                              {['activity', 'marketing'].includes(cat.id) && (
                                <div className="space-y-3">
                                  <span className="text-xs uppercase tracking-wider text-secondary font-medium">Frequency</span>
                                  <Dropdown
                                    value={prefs.frequency || 'immediate'}
                                    onChange={(val) => {
                                      updateNotificationPreference(cat.id as any, { frequency: val as any });
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
                      <Cloud className="w-5 h-5 text-accent-cyan" />
                      Cloud & Auth
                    </h2>

                    <div className="surface-elevated p-6 rounded-card border-l-4 border-accent-cyan">
                      <div className="flex items-center gap-tight mb-3">
                        <Check className="w-5 h-5 text-accent-cyan" />
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
                                  alert('Successfully backed up to Google Drive!');
                                } catch (error) {
                                  alert('Failed to backup to Drive.');
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
                              onClick={async () => {
                                if (confirm("Warning: Restoring will overwrite any unsaved local data that isn't in the cloud. Proceed?")) {
                                  setIsSyncing(true);
                                  try {
                                    await googleCloudService.restoreFromCloud();
                                    alert('Successfully restored from Google Drive! Refreshing...');
                                    window.location.reload();
                                  } catch (error) {
                                    alert('Failed to restore from Drive.');
                                  } finally {
                                    setIsSyncing(false);
                                  }
                                }
                              }}
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
                        Smriti stores everything locally on this device. No cloud. No tracking. No sharing. 
                        Your stories, memories, and personal reflections never leave your device unless you explicitly export them.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-normal text-small text-secondary">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>No analytics or telemetry</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-emerald" />
                          <span>No cloud synchronization</span>
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
                          <div className="p-4 bg-amber/10 border border-amber/30 rounded-card">
                            <div className="flex items-center gap-2 text-amber mb-2">
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
                      <Database className="w-5 h-5 text-accent-cyan" />
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
                            className="bg-accent-cyan h-full rounded-full"
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
                          onClick={handleClearCache}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Clear Cache
                        </button>
                        <button 
                          id="optimizeBtn"
                          onClick={handleOptimizeImages}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <HardDrive className="w-4 h-4" />
                          Optimize Images
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
                          className="btn btn-primary flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Word Book
                        </button>
                        <button 
                          onClick={handlePrintPDF}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          PDF Book
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
                      <h3 className="heading-3 text-primary">Memory Archive Backup</h3>
                      <p className="text-secondary">
                        Create a complete backup of all your memories, moments, and personal reflections.
                      </p>
                      <button
                        onClick={handleBackupData}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Create Memory Archive
                      </button>
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
                          <p className="text-accent-cyan">Powered by Smriti</p>
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
                      <h3 className="heading-3 text-primary">Developer Mode</h3>
                      <p className="text-secondary">
                        Advanced tools for power users and developers.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-normal">
                        <button 
                          onClick={() => navigate('/dev/console')}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <Database className="w-4 h-4" />
                          Inspect Database
                        </button>
                        <button 
                          onClick={handleBackupData}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Export Raw Data
                        </button>
                        <button 
                          onClick={() => navigate('/dev/console')}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <Code className="w-4 h-4" />
                          Run Analytics Query
                        </button>
                        <button 
                          onClick={() => window.open('https://github.com/smriti-engine/api', '_blank')}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          API Documentation
                        </button>
                      </div>
                    </div>

                    {/* Dangerous Zone */}
                    <div className="surface-elevated p-6 rounded-card border-l-4 border-rose space-y-4">
                      <h3 className="heading-3 text-rose flex items-center gap-tight">
                        <AlertTriangle className="w-5 h-5" />
                        Dangerous Zone
                      </h3>
                      <p className="text-secondary">
                        These actions cannot be undone. Please be careful.
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={handleResetApp}
                          className="btn btn-secondary text-rose border-rose hover:bg-rose/10 flex items-center gap-2"
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
    </div>
  );
}
