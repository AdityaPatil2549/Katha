export interface SystemInfo {
  isOnline: boolean;
  isPWAInstalled: boolean;
  storageQuota?: {
    used: number; // MB
    quota: number; // MB
    percentage: number;
  };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

export interface SystemService {
  getSystemInfo(): Promise<SystemInfo>;
  requestPersistentStorage(): Promise<boolean>;
  clearCache(): Promise<void>;
  checkServiceWorker(): Promise<boolean>;
  registerServiceWorker(): Promise<void>;
}
