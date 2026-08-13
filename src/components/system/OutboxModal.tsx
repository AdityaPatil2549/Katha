import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/KathaDb';
import { dbService } from '@/db/DatabaseService';

interface OutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isSyncing: boolean;
}

export function OutboxModal({ isOpen, onClose, isOnline, isSyncing }: OutboxModalProps) {
  // Query the local sync queue
  const syncItems = useLiveQuery(() => db.syncQueue.orderBy('timestamp').toArray(), []);

  const handleForceSync = async () => {
    if (!isOnline) {
      alert("You are offline. Reconnect to sync.");
      return;
    }
    await dbService.syncManager.flushQueue();
  };

  const handleRemoveItem = async (id: string) => {
    if (confirm("Are you sure? Removing this item will discard your local changes permanently.")) {
      await db.syncQueue.delete(id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-midnight-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-midnight-surface/90 border border-midnight-border rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-midnight-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-cyan/10 rounded-full">
                  <Cloud className="w-5 h-5 text-accent-cyan" />
                </div>
                <h2 className="font-serif text-2xl text-text-primary">Sync Outbox</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {!isOnline && (
                <div className="flex items-start gap-3 p-4 bg-accent-amber/10 border border-accent-amber/20 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
                  <p className="text-sm font-sans text-accent-amber/90">
                    You are currently offline. These items are saved locally and will automatically sync when connection is restored.
                  </p>
                </div>
              )}

              {!syncItems || syncItems.length === 0 ? (
                <div className="text-center py-10">
                  <Cloud className="w-12 h-12 mx-auto text-text-muted opacity-20 mb-4" />
                  <p className="text-text-secondary font-sans">Your outbox is empty. Everything is synced!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {syncItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-midnight-surface border border-midnight-border/50 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-text-primary uppercase tracking-wider mb-1">
                          {item.operation} {item.storeName}
                        </div>
                        <div className="text-xs text-text-muted font-sans truncate max-w-[200px] sm:max-w-[250px]">
                          ID: {item.documentId}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.retryCount > 0 && (
                          <span className="text-[10px] text-accent-rose uppercase tracking-wider px-2 py-0.5 border border-accent-rose/30 rounded-full bg-accent-rose/10">
                            Failed ({item.retryCount})
                          </span>
                        )}
                        <button
                          onClick={() => item.id && handleRemoveItem(item.id)}
                          className="p-2 text-text-muted hover:text-accent-rose transition-colors"
                          title="Discard Change"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {syncItems && syncItems.length > 0 && (
              <div className="p-6 border-t border-midnight-border/50 bg-midnight-surface/30 flex justify-end">
                <button
                  onClick={handleForceSync}
                  disabled={!isOnline || isSyncing}
                  className="px-6 py-2.5 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 rounded-button text-sm font-medium tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      Force Sync Now
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
