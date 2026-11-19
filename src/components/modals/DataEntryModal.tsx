import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type EntryType = 'insight' | 'principle' | 'quote' | 'story' | 'lesson' | 'session' | 'knowledge';

export interface DataEntryFormValues {
  title?: string;
  description?: string;
  content?: string;
  attribution?: string;
  name?: string;
  narrative?: string;
  details?: string;
}

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DataEntryFormValues) => void | Promise<void>;
  type: EntryType;
}

export function DataEntryModal({ isOpen, onClose, onSubmit, type }: DataEntryModalProps) {
  const [formData, setFormData] = useState<DataEntryFormValues>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({});
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'insight':
      case 'lesson':
        return (
          <>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Title *</label>
              <input required type="text" className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Description *</label>
              <textarea required rows={4} className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </>
        );
      case 'quote':
        return (
          <>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Quote Content *</label>
              <textarea required rows={3} className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none resize-none" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Attribution / Author *</label>
              <input required type="text" className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none" value={formData.attribution || ''} onChange={e => setFormData({...formData, attribution: e.target.value})} />
            </div>
          </>
        );
      case 'principle':
        return (
          <>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Principle Name *</label>
              <input required type="text" className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Description *</label>
              <textarea required rows={3} className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </>
        );
      case 'story':
        return (
          <>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Story Title *</label>
              <input required type="text" className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Narrative *</label>
              <textarea required rows={6} className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none resize-none" value={formData.narrative || ''} onChange={e => setFormData({...formData, narrative: e.target.value})} />
            </div>
          </>
        );
      default:
        return (
          <>
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-secondary mb-3">Details *</label>
              <textarea required rows={4} className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary outline-none resize-none" value={formData.details || ''} onChange={e => setFormData({...formData, details: e.target.value})} />
            </div>
          </>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-entry-modal-title"
        className="fixed inset-0 bg-text-primary/40 dark:bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-surface-primary border border-border-default rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevation"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 md:p-10">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border-default">
              <h2 id="data-entry-modal-title" className="font-serif text-3xl text-text-primary capitalize">Add {type}</h2>
              <button
                type="button"
                aria-label="Close entry dialog"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderFields()}

              <div className="flex justify-end gap-4 pt-8">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : `Save ${type}`}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
