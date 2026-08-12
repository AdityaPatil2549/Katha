import type { ReactNode, ErrorInfo } from 'react';
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, HardDrive } from 'lucide-react';
import { dbService } from '@/db/DatabaseService';

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  isResetting?: boolean;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, isResetting: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetLocalData = async () => {
    this.setState({ isResetting: true });
    try {
      await dbService.clearAll();
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to reset local data:', err);
      this.setState({ isResetting: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100] min-h-screen bg-midnight-bg flex items-center justify-center p-6 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-lg bg-midnight-surface/80 backdrop-blur-3xl border border-red-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
            
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-3 font-serif italic tracking-wide">System Anomaly Detected</h1>
            <p className="text-red-200/80 mb-6">
              A critical structural error occurred while rendering this dimension of your story.
            </p>

            <div className="bg-black/40 rounded-xl p-4 mb-8 border border-red-500/10 text-left overflow-hidden">
              <p className="text-red-400 font-mono text-sm break-all line-clamp-3">
                {this.state.error?.message || 'Unknown render exception'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>
              
              <button 
                onClick={this.handleResetLocalData}
                disabled={this.state.isResetting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <HardDrive className="w-5 h-5" />
                {this.state.isResetting ? 'Purging Local Data...' : 'Reset Local Storage Cache'}
              </button>
              <p className="text-xs text-text-tertiary mt-2">
                If the error persists, resetting local storage will wipe your offline cache and resync from the cloud.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
