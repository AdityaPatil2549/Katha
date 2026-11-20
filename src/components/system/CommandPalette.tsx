import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  Library, 
  Compass, 
  Users, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Brain, 
  Book, 
  Calendar, 
  Trophy, 
  Sparkles, 
  Plus, 
  Settings, 
  Download,
  Film,
  X,
  CornerDownLeft
} from 'lucide-react';
import { useStoriesStore } from '@/store';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Atlas & Wisdom' | 'Personal' | 'Stories';
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: () => void;
  badge?: string;
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { stories } = useStoriesStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard listener for Esc and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const defaultCommands: CommandItem[] = [
    { id: 'home', title: 'Home Dashboard', category: 'Navigation', icon: Home, path: '/' },
    { id: 'library', title: 'My Story Library', category: 'Navigation', icon: Library, path: '/library' },
    { id: 'explore-atlas', title: 'Smriti Atlas (50+ Masterpieces)', category: 'Atlas & Wisdom', icon: Compass, path: '/explore?tab=atlas', badge: 'Core' },
    { id: 'explore-life-phases', title: 'Life Phase Recommendations', category: 'Atlas & Wisdom', icon: Users, path: '/explore?tab=life-phases', badge: 'Wisdom' },
    { id: 'explore-decision', title: 'Dilemma Decision Engine', category: 'Atlas & Wisdom', icon: Target, path: '/explore?tab=decision', badge: 'Tool' },
    { id: 'explore-trending', title: 'Global Trakt Trends', category: 'Atlas & Wisdom', icon: TrendingUp, path: '/explore?tab=trending' },
    { id: 'explore-wisdom', title: 'Wisdom Vault & Quotes', category: 'Atlas & Wisdom', icon: Lightbulb, path: '/explore?tab=wisdom' },
    { id: 'intelligence', title: 'Smriti Intelligence & Wrapped', category: 'Personal', icon: Brain, path: '/intelligence', badge: 'AI' },
    { id: 'journal', title: 'Reflective Story Journal', category: 'Personal', icon: Book, path: '/journal' },
    { id: 'calendar', title: 'Watch Calendar & Streaks', category: 'Personal', icon: Calendar, path: '/calendar' },
    { id: 'achievements', title: 'Achievements & Milestones', category: 'Personal', icon: Trophy, path: '/achievements' },
    { id: 'memories', title: 'Memory World (Realms & Resurfacing)', category: 'Personal', icon: Sparkles, path: '/memory-world' },
    { id: 'add-story', title: 'Add New Story', category: 'Personal', icon: Plus, path: '/add-story' },
    { id: 'export', title: 'Export Vault (Word, PDF, Markdown)', category: 'Navigation', icon: Download, path: '/export-system' },
    { id: 'settings', title: 'Settings Vault & Theme', category: 'Navigation', icon: Settings, path: '/settings-vault' },
  ];

  // Story items mapped to commands
  const storyCommands: CommandItem[] = stories.map((s) => ({
    id: `story-${s.id}`,
    title: s.title,
    category: 'Stories',
    icon: Film,
    path: `/story/${s.id}`,
    badge: s.category
  }));

  const allItems = [...defaultCommands, ...storyCommands];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : defaultCommands;

  const handleSelect = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-midnight-surface/95 border border-midnight-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
          >
            {/* Search Bar Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-midnight-border bg-midnight-bg/40">
              <Search className="w-5 h-5 text-accent-gold shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Jump to a story, life phase, tool, or command..."
                className="w-full bg-transparent border-none text-base text-text-primary placeholder:text-text-muted focus:outline-none min-h-[44px] py-2"
              />
              <button
                type="button"
                onClick={onClose}
                className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                aria-label="Close command palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command List */}
            <div className="overflow-y-auto p-2 divide-y divide-midnight-border/30">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-accent-primary/15 text-text-primary border border-accent-primary/30'
                          : 'text-text-secondary hover:text-text-primary hover:bg-midnight-surface-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent-primary/20 text-accent-primary' : 'bg-midnight-border/50 text-text-muted'}`}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate text-text-primary">{item.title}</span>
                          <span className="text-xs text-text-muted">{item.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
                            {item.badge}
                          </span>
                        )}
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-text-muted text-sm">
                  No matching stories, tools, or commands found for "{query}".
                </div>
              )}
            </div>

            {/* Footer Hint */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-midnight-bg/70 border-t border-midnight-border text-xs text-text-muted">
              <div className="flex items-center gap-4">
                <span>Use <kbd className="px-1.5 py-0.5 rounded bg-midnight-surface border border-midnight-border text-xs font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-midnight-surface border border-midnight-border text-xs font-mono">↓</kbd> to navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-midnight-surface border border-midnight-border text-xs font-mono">↵</kbd> to select</span>
              </div>
              <span><kbd className="px-1.5 py-0.5 rounded bg-midnight-surface border border-midnight-border text-xs font-mono">ESC</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
