import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppStatusBar } from '@/components/system/AppStatusBar';
import { UserOnboarding } from '@/features/onboarding/UserOnboarding';
import { KathaCosmos } from '@/components/canvas/KathaCosmos';
import { useMagneticCursor } from '@/hooks/useMagneticCursor';
import { useState, useRef, useEffect } from 'react';
import { User, Settings, Download, Brain, Trophy, Calendar, ChevronDown, Book, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useSyncStore } from '@/store/syncStore';
import { OutboxModal } from '@/components/system/OutboxModal';
import { isOfflineMode } from '@/lib/firebase';
import { AnimatedBackground } from '@/components/ui/motion/AnimatedBackground';

const primaryNav = [
  { path: '/', label: 'Home' },
  { path: '/library', label: 'My List' },
  { path: '/discover-world', label: 'Explore' },
  { path: '/memory-world', label: 'Memories' }
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
  const [showOutbox, setShowOutbox] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize global magnetic cursor
  useMagneticCursor();

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen font-sans text-text-primary selection:bg-accent-rose selection:text-text-primary flex flex-col relative" style={{ background: 'transparent' }}>
      
      {/* 3D WebGL Background (Phase 1) */}
      <KathaCosmos />
      
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
                      relative px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300
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
          <div className="flex items-center gap-5">
            
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
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight-surface/50 border border-midnight-border backdrop-blur-sm hover:bg-white/5 transition-colors"
              title="View Sync Outbox"
            >
              {!isOnline ? (
                <>
                  <CloudOff className="w-4 h-4 text-accent-amber" />
                  <span className="text-xs font-medium text-text-secondary">Offline {pendingCount > 0 && `(${pendingCount})`}</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 text-accent-cyan animate-spin" />
                  <span className="text-xs font-medium text-text-secondary">Syncing...</span>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <Cloud className="w-4 h-4 text-accent-cyan" />
                  <span className="text-xs font-medium text-text-secondary">{pendingCount} Pending</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-accent-emerald" />
                  <span className="text-xs font-medium text-text-secondary">Synced</span>
                </>
              )}
            </button>

            {/* Smriti Intelligence Premium Button */}
            <button 
              onClick={() => navigate('/intelligence')}
              className="group relative hidden md:flex items-center gap-2.5 px-5 py-2 rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
              style={{ boxShadow: '0 0 20px rgba(139,92,246,0.15)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-full border border-violet-500/30 group-hover:border-violet-400/60 transition-colors duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 blur-xl transition-opacity duration-500" />
              <Brain className="w-4 h-4 text-violet-300 group-hover:text-white transition-colors relative z-10" />
              <span className="text-sm font-bold tracking-widest uppercase text-violet-200 group-hover:text-white transition-colors relative z-10">
                Intelligence
              </span>
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                className="flex items-center gap-3 hover:bg-text-primary/10 p-2 pr-4 rounded-full transition-colors duration-300 group"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-cinematic p-[2px]">
                  <div className="w-full h-full bg-midnight-surface rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-text-primary" />
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-secondary group-hover:text-text-primary transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
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
        <div className={`w-full min-h-screen ${location.pathname !== '/' ? 'pt-28 md:pt-32 pb-20 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto' : ''}`}>
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

      {/* Global Status Dock */}
      <AppStatusBar />

      <UserOnboarding />
      
      <OutboxModal 
        isOpen={showOutbox} 
        onClose={() => setShowOutbox(false)} 
        isOnline={isOnline}
        isSyncing={isSyncing}
      />
    </div>
  );
}
