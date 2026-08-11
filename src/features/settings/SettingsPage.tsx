import { useState, useEffect } from 'react';
import { Settings, Download, Trash2, Shield, Database, Wifi, HardDrive, RefreshCw, Upload, Cloud } from 'lucide-react';
import { SystemStatus } from '@/components/system/SystemStatus';
import { systemService } from '@/services';
import { dbService } from '@/db/DatabaseService';

export default function SettingsPage() {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const info = await systemService.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const usage = await dbService.getStorageUsage();
      const data = {
        stories: await dbService.stories.findAll(),
        moments: await dbService.moments.findAll(),
        sessions: await dbService.sessions.findAll(),
        knowledge: await dbService.knowledge.findAll(),
        timeline: await dbService.timeline.findAll(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `katha-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await dbService.clearAll();
      await systemService.clearCache();
      window.location.reload();
    } catch (error) {
      console.error('Clear data failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRequestPersistentStorage = async () => {
    try {
      const granted = await systemService.requestPersistentStorage();
      if (granted) {
        alert('Persistent storage granted! Your data will be preserved.');
      } else {
        alert('Persistent storage not granted. Data may be cleared by the browser.');
      }
      loadSystemInfo();
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
    }
  };

  const handleRefreshSystem = async () => {
    setIsRefreshing(true);
    try {
      await systemService.checkServiceWorker();
      await loadSystemInfo();
    } catch (error) {
      console.error('System refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="heading-1 text-primary">Settings</h1>
      </div>

      {/* System Status */}
      <SystemStatus />

      {/* Data Management */}
      <div className="surface-card rounded-lg p-6 space-y-4">
        <button onClick={() => {
          window.location.href = '/dev/console';
        }} className="btn btn-secondary flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <span>Inspect Database</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Restore Memory
          </button>

          <button
            onClick={handleClearData}
            disabled={isClearing}
            className="btn btn-secondary flex items-center justify-center gap-2 text-rose hover:bg-rose/10"
          >
            <Trash2 className="w-4 h-4" />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>

      {/* Storage & Privacy */}
      <div className="surface-card rounded-lg p-6 space-y-4">
        <button onClick={() => {
          // Sync logic mock
          alert('Sync complete!');
        }} className="btn btn-primary flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          Force Sync Now
        </button>

        <div className="space-y-3">
          <button
            onClick={handleRequestPersistentStorage}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <HardDrive className="w-4 h-4" />
            Request Persistent Storage
          </button>

          <p className="text-body text-secondary mb-4">
            Katha is a personal story tracker powered by Smriti — a memory engine for your entertainment life.
          </p>
          <p className="text-body text-secondary mb-4">
            Every movie, every series, every experience.
            Stored locally. Protected forever.
          </p>

          <p className="text-small text-muted mt-4">
            Smriti stores everything locally on your device.
            No cloud. No tracking. No sharing.
          </p>
        </div>
      </div>

      {/* System Actions */}
      <div className="surface-card rounded-lg p-6 space-y-4">
        <h1 className="heading-1 text-primary flex items-center gap-3">
          <Settings className="w-6 h-6" />
          Katha Settings
        </h1>

        <div className="space-y-3">
          <button
            onClick={handleRefreshSystem}
            disabled={isRefreshing}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh System'}
          </button>

          <div className="text-caption text-muted">
            Refresh system status and check service worker health.
          </div>
        </div>
      </div>

      {/* About */}
      <div className="surface-card rounded-lg p-6 space-y-4">
        <h2 className="heading-2 text-primary mb-4">System Status</h2>

        <div className="space-y-2 text-body text-secondary">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Description:</strong> Local-first, offline-first Personal Story Operating System powered by Smriti.</p>
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-small text-muted">
            <li>Complete offline functionality</li>
            <li>Local data storage with optional encryption</li>
            <li>PWA capabilities for native app experience</li>
            <li>Privacy-first design with no data collection</li>
            <li>Emotional intelligence and mood tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

