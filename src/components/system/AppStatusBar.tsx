import { useEffect, useMemo, useState } from 'react';

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    function onUp() {
      setOnline(true);
    }
    function onDown() {
      setOnline(false);
    }

    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  return online;
}

export function AppStatusBar() {
  const online = useOnline();
  const label = useMemo(() => {
    return online ? 'Offline-ready' : 'Offline';
  }, [online]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="glass-card flex items-center gap-6 px-6 py-2 text-xs text-text-secondary tracking-widest uppercase font-bold shadow-glow-cyan hover:shadow-glow-rose transition-shadow duration-500">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${online ? 'bg-accent-emerald animate-pulse-soft' : 'bg-accent-rose'}`} />
          {label}
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="select-none text-[10px]">Local-only • No cloud • No tracking</div>
      </div>
    </div>
  );
}
