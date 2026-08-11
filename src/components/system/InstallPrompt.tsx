import { useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const canShow = useMemo(() => {
    return Boolean(event) && !dismissed;
  }, [event, dismissed]);

  if (!canShow) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[min(420px,calc(100vw-2rem))] surface-elevated p-4 animate-slide-up">
      <div className="text-small font-semibold text-primary">Install Katha</div>
      <div className="mt-1 text-caption text-secondary">
        Add Katha to your home screen for a calmer, app-like experience and reliable offline access.
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          className="btn btn-ghost text-caption"
          type="button"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </button>
        <button
          className="btn btn-primary chip-cyan text-caption"
          type="button"
          onClick={async () => {
            if (!event) return;
            await event.prompt();
            const choice = await event.userChoice;
            if (choice.outcome === 'accepted') {
              setDismissed(true);
            }
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}
