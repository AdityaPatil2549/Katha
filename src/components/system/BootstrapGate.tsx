import type { ReactNode } from 'react';
import { useBootstrap } from '@/app/useBootstrap';
import { LoadingScreen } from '@/components/system/LoadingScreen';

export function BootstrapGate({ children }: { children: ReactNode }) {
  const { ready, error } = useBootstrap();

  if (error) {
    return (
      <div className="surface-elevated p-6 max-w-md mx-auto mt-page">
        <div className="heading-3 text-gradient-rose">Katha couldn't start</div>
        <div className="mt-2 text-small text-secondary">
          Something prevented the local database from initializing.
        </div>
        <div className="mt-4">
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <LoadingScreen title="Preparing your library" subtitle="Initializing local vault…" />;
  }

  return children;
}
