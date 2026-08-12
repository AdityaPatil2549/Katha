import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { BootstrapGate } from '@/components/system/BootstrapGate';
import { InstallPrompt } from '@/components/system/InstallPrompt';
import { PwaUpdatePrompt } from '@/components/system/PwaUpdatePrompt';
import { OfflineIndicator } from '@/components/system/OfflineIndicator';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/system/ToastProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BootstrapGate>
            {children}
            <InstallPrompt />
            <PwaUpdatePrompt />
            <OfflineIndicator />
          </BootstrapGate>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
