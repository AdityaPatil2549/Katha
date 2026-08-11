import type { ReactNode } from 'react';
import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-midnight-border bg-midnight-surface p-6 shadow-soft">
          <div className="text-lg font-semibold">Something went wrong</div>
          <div className="mt-2 text-sm text-text-primary/70">
            Katha hit an unexpected error. Reloading the app usually fixes it.
          </div>
          {this.state.error && (
            <div className="mt-4 p-4 bg-black/50 rounded overflow-auto text-xs text-red-400 font-mono">
              <p className="font-bold">{this.state.error.message}</p>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
            </div>
          )}
          <div className="mt-4">
            <button
              className="rounded-md bg-accent-cyan px-4 py-2 text-sm font-medium text-midnight-bg"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
