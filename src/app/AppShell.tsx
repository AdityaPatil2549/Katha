import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppStatusBar } from '@/components/system/AppStatusBar';
import { UserOnboarding } from '@/features/onboarding/UserOnboarding';
import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import {
  User,
  Settings,
  Download,
  Brain,
  Trophy,
  Calendar,
  ChevronDown,
  Book,
  Cloud,
  CloudOff,
  RefreshCw,
  Home,
  Library,
  Compass,
  Sparkles,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useSyncStore } from '@/store/syncStore';
import { OutboxModal } from '@/components/system/OutboxModal';
import { isOfflineMode } from '@/lib/firebase';
import { AnimatedBackground } from '@/components/ui/motion/AnimatedBackground';
import { CommandPalette } from '@/components/system/CommandPalette';

const KathaCosmos = lazy(() =>
  import('@/components/canvas/KathaCosmos').then((m) => ({ default: m.KathaCosmos }))
);

const primaryNav = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/library', label: 'My List', icon: Library },
  { path: '/explore', label: 'Atlas', icon: Compass },
  { path: '/memory-world', label: 'Memories', icon: Sparkles }
];

const secondaryNav = [
  { path: '/journal', label: 'Journal', icon: Book },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/export-system', label: 'Export', icon: Download },
  { path: '/settings-vault', label: 'Settings', icon: Settings }
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline, isSyncing, pendingCount } = useSyncStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [showOutbox, setShowOutbox] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
        setShowMobileMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="min-h-screen font-sans text-text-primary selection:bg-accent-rose selection:text-text-primary flex flex-col relative" style={{ background: 'transparent' }}>
      
      {/* 3D WebGL Background (Lazy loaded to keep initial bundle light) */}
      <Suspense fallback={null}>
        <KathaCosmos />
      </Suspense>
      
      {/* Background Noise overlay for texture */}
      <div className="fixed inset-0 bg-noise opacity-10 pointer-events-none z-[1]" />
      
      {/* Floating Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none flex justify-center">
        <header className={`pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] flex items-center justify-between ${isScrolled ? 'glass-card py-3 px-6 w-full max-w-5xl' : 'bg-transparent py-4 w-full max-w-7xl'}`}>
          
          {/* Logo & Primary Nav */}
          <div className="flex items-center gap-12">
            <div className="cursor-pointer hover:scale-105 transition-transform duration-500 w-[52px] h-[52px] relative flex items-center justify-center" onClick={() => navigate('/')}>
              <img src="/icons/logo-dark.png" alt="Katha" className="w-full h-full object-contain logo-dark" />
              <img src="/icons/logo-light.png" alt="Katha" className="w-full h-full object-contain logo-light" />
            </div>
            
            <nav className="hidden md:flex items-center gap-2">
              <AnimatedBackground 
                enableHover 
                defaultValue={location.pathname} 
                className="bg-text-primary/10 rounded-full"
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                {primaryNav.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    data-id={item.path}
                    onMouseEnter={() => {
                      // Subtle haptic feedback if supported by device
                      if (navigator.vibrate) navigator.vibrate(10);
                    }}
                    className={({ isActive }) => `
                      relative min-h-[44px] px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.18em] uppercase transition-all duration-300 flex items-center justify-center
                      ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}
                    `}
                    end={item.path === '/'}
                  >
                    <span className="relative z-10">{item.label}</span>
                  </NavLink>
                ))}
              </AnimatedBackground>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Command Palette (Cmd+K) Trigger */}
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-full bg-midnight-surface/80 border border-midnight-border text-text-secondary hover:text-text-primary hover:bg-midnight-surface-hover transition-colors shadow-sm"
              title="Open Command Palette (Cmd+K)"
              aria-label="Open Command Palette"
            >
              <Search className="w-4 h-4 text-text-muted" />
              <span className="hidden lg:inline text-xs font-medium">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-midnight-bg/60 border border-midnight-border text-[10px] font-mono text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Offline Mode Indicator (Firebase failed to init) */}
            {isOfflineMode && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-rose/20 border border-accent-rose/30 backdrop-blur-sm shadow-glow-sm" title="Firebase configuration missing. Running in local-only mode.">
                <CloudOff className="w-4 h-4 text-accent-rose animate-pulse" />
                <span className="text-xs font-bold text-accent-rose uppercase tracking-wider">Local Mode</span>
              </div>
            )}

            {/* Sync Indicator */}
            <button 
              onClick={() => setShowOutbox(true)}
              className="flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-full bg-midnight-surface/80 border border-midnight-border backdrop-blur-sm hover:bg-midnight-surface-hover transition-colors shadow-sm"
              title="View Sync Outbox"
              aria-label="View Sync Outbox"
            >
              {!isOnline ? (
                <>
                  <CloudOff className="w-4 h-4 text-accent-amber" />
                  <span className="hidden sm:inline text-xs font-medium text-text-secondary">Offline {pendingCount > 0 && `(${pendingCount})`}</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 text-accent-cyan animate-spin" />
                  <span className="hidden sm:inline text-xs font-medium text-text-secondary">Syncing...</span>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <Cloud className="w-4 h-4 text-accent-cyan" />
                  <span className="hidden sm:inline text-xs font-medium text-text-secondary">{pendingCount} Pending</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-accent-emerald" />
                  <span className="hidden sm:inline text-xs font-medium text-text-secondary">Synced</span>
                </>
              )}
            </button>

            {/* Smriti Intelligence Button */}
            <button 
              onClick={() => navigate('/intelligence')}
              className="group relative flex items-center gap-2 min-h-[44px] px-3.5 sm:px-4 py-2 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 bg-accent-primary/10 border border-accent-primary/35 hover:bg-accent-primary/20 text-accent-primary shadow-sm"
              title="Smriti Intelligence & Insights"
              aria-label="Smriti Intelligence"
            >
              <Brain className="w-4 h-4 relative z-10 shrink-0" />
              <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase relative z-10">
                Intelligence
              </span>
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                type="button"
                aria-label="Open menu"
                aria-expanded={showProfileMenu}
                className="flex items-center gap-2.5 hover:bg-text-primary/10 min-h-[44px] p-1.5 pr-3 rounded-full transition-colors duration-300 group"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-cinematic p-[2px]">
                  <div className="w-full h-full bg-midnight-surface rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-text-primary" />
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-14 w-64 bg-midnight-surface/90 backdrop-blur-3xl border border-midnight-border rounded-2xl shadow-glow overflow-hidden py-2"
                  >
                    {secondaryNav.map((item) => (
                      <button
                        key={item.path}
                        className="w-full flex items-center gap-4 px-6 py-4 text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary hover:bg-text-primary/5 transition-colors duration-200"
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate(item.path);
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <div className={`w-full min-h-screen ${location.pathname !== '/' ? 'pt-28 md:pt-32 pb-28 md:pb-20 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(12px) brightness(1.5)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px) brightness(0.5)' }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-midnight-surface/95 backdrop-blur-xl border-t border-midnight-border px-2 py-2 flex items-center justify-around"
      >
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setShowMobileMore(false)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setShowMobileMore((prev) => !prev)}
          aria-expanded={showMobileMore}
          aria-label="More navigation links"
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            showMobileMore ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {showMobileMore ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span>More</span>
        </button>
      </nav>

      {/* Mobile More Sheet */}
      <AnimatePresence>
        {showMobileMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed bottom-16 left-3 right-3 z-50 bg-midnight-surface/95 backdrop-blur-2xl border border-midnight-border rounded-2xl shadow-glow p-2 grid grid-cols-2 gap-1.5"
          >
            <button
              type="button"
              onClick={() => {
                setShowMobileMore(false);
                navigate('/intelligence');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-accent-primary bg-accent-primary/10 border border-accent-primary/20 col-span-2"
            >
              <Brain className="w-4 h-4" />
              <span>Smriti Intelligence</span>
            </button>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setShowMobileMore(false);
                    navigate(item.path);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-midnight-surface-hover transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Status Dock */}
      <AppStatusBar />

      <UserOnboarding />
      
      <OutboxModal 
        isOpen={showOutbox} 
        onClose={() => setShowOutbox(false)} 
        isOnline={isOnline}
        isSyncing={isSyncing}
      />

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
    </div>
  );
}
