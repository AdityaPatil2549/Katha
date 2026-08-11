import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const [show, setShow] = useState(false);
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      setShow(true);
    },
    onOfflineReady() {
      // no-op: we already show offline status in the shell
    }
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShow(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] surface-elevated p-4 animate-slide-up">
      <div className="text-small font-semibold text-primary">Update available</div>
      <div className="mt-1 text-caption text-secondary">
        A newer version of Katha is ready. Updating keeps your app fresh; your local data stays on-device.
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          className="btn btn-ghost text-caption"
          type="button"
          onClick={() => setShow(false)}
        >
          Not now
        </button>
        <button
          className="btn btn-primary text-caption"
          type="button"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </button>
      </div>
    </div>
  );
}
