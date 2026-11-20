import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/KathaDb';
import { dbService } from '@/db/DatabaseService';
import { useToastStore } from '@/store/toastStore';

interface OutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isSyncing: boolean;
}

export function OutboxModal({ isOpen, onClose, isOnline, isSyncing }: OutboxModalProps) {
  const activeUserId = dbService.getUserId();
  const addToast = useToastStore((s) => s.addToast);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(null);

  // Query only the active account's pending sync items
  const syncItems = useLiveQuery(async () => {
    const items = await db.syncQueue.orderBy('timestamp').toArray();
    return items.filter((item) => (!item.userId && !activeUserId) || item.userId === activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    if (!isOpen) {
      setConfirmDiscardId(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleForceSync = async () => {
    if (!isOnline) {
      addToast({ type: 'warning', message: 'You are offline. Reconnect to sync pending items.' });
      return;
    }
    await dbService.syncManager.flushQueue();
  };

  const handleRemoveItem = async (id: string) => {
    await db.syncQueue.delete(id);
    setConfirmDiscardId(null);
    addToast({ type: 'info', message: 'Local queued mutation discarded.' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="outbox-modal-title"
          className="fixed inset-0 bg-midnight-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-midnight-surface border border-midnight-border rounded-modal max-w-lg w-full shadow-soft overflow-hidden"
          >
            <div className="p-6 border-b border-midnight-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-gold/15 rounded-full">
                  <Cloud className="w-5 h-5 text-accent-gold" />
                </div>
                <h2 id="outbox-modal-title" className="font-serif text-2xl text-text-primary">
                  Sync Outbox
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Sync Outbox"
                className="p-2 rounded-full hover:bg-midnight-surface-hover text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {!isOnline && (
                <div className="flex items-start gap-3 p-4 bg-accent-amber/10 border border-accent-amber/30 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
                  <p className="text-sm font-sans text-text-primary">
                    You are currently offline. These items are saved locally and will sync automatically when connection is restored.
                  </p>
                </div>
              )}

              {!syncItems || syncItems.length === 0 ? (
                <div className="text-center py-10">
                  <Cloud className="w-12 h-12 mx-auto text-text-muted opacity-30 mb-4" />
                  <p className="text-text-secondary font-sans">Your outbox is empty. Everything is synced!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {syncItems.map((item) => {
                    const docId =
                      typeof item.data === 'object' && item.data !== null && 'id' in item.data
                        ? String((item.data as { id?: unknown }).id ?? item.id)
                        : item.id;
                    const isConfirming = confirmDiscardId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-4 bg-midnight-bg/60 border border-midnight-border rounded-xl"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-text-primary uppercase tracking-wider mb-1">
                            {item.action} {item.table}
                          </div>
                          <div className="text-xs text-text-muted font-sans truncate max-w-[200px] sm:max-w-[260px]">
                            ID: {docId}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isConfirming ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="px-2.5 py-1 rounded-md bg-accent-rose text-white text-xs font-medium hover:opacity-90"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDiscardId(null)}
                                className="px-2.5 py-1 rounded-md border border-midnight-border text-xs text-text-secondary hover:text-text-primary"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDiscardId(item.id)}
                              aria-label={`Discard ${item.action} for ${docId}`}
                              className="p-2 text-text-muted hover:text-accent-rose transition-colors rounded-lg"
                              title="Discard Change"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {syncItems && syncItems.length > 0 && (
              <div className="p-6 border-t border-midnight-border bg-midnight-bg/40 flex justify-end">
                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={!isOnline || isSyncing}
                  className="min-h-[44px] px-6 py-2.5 bg-accent-gold/15 hover:bg-accent-gold/25 text-accent-gold border border-accent-gold/30 rounded-button text-sm font-medium tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
