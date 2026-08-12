import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PenTool, Book, Tag, Loader2, Calendar, Hash, Trash2 } from 'lucide-react';
import { personalRepository } from '@/db/repositories/PersonalRepository';
import type { JournalEntry } from '@/types/personal';

export default function JournalPage() {
  const [activeTab, setActiveTab] = useState<'write' | 'search'>('write');

  // Write tab state
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(JournalEntry & { score: number })[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ── Load existing entries on mount ────────────────────────────────────────
  const loadEntries = useCallback(async () => {
    setIsLoadingEntries(true);
    try {
      const all = await personalRepository.getAllJournalEntries();
      setEntries(all);
    } finally {
      setIsLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // ── Save new entry ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await personalRepository.addJournalEntry(content, tagArray);
      setContent('');
      setTags('');
      await loadEntries(); // Refresh list
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Debounced semantic search ─────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await personalRepository.semanticSearchJournals(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-primary mb-2">
            Memory Journal
          </h1>
          <p className="text-text-secondary">
            Record your thoughts. Search them by meaning, not just words.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-3 mb-8">
          {([
            { id: 'write', label: 'Write', icon: PenTool, accent: 'from-accent-primary to-purple-600' },
            { id: 'search', label: 'Semantic Search', icon: Search, accent: 'from-accent-cyan to-blue-500' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 text-sm ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.accent} text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]`
                  : 'bg-midnight-surface text-text-secondary hover:text-text-primary border border-white/5 hover:border-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'write' && entries.length > 0 && (
                <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {entries.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* ── Write tab ────────────────────────────────────────────────── */}
          {activeTab === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Compose box */}
              <div className="bg-midnight-surface/80 border border-white/8 rounded-2xl p-6 backdrop-blur-md">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What did you watch? How did it make you feel? What did it change in you?..."
                  className="w-full h-52 bg-transparent text-text-primary placeholder-text-muted outline-none resize-none leading-relaxed text-base"
                />
                <div className="border-t border-white/5 pt-4 mt-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative flex-1 w-full">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      placeholder="Tags — comma separated (e.g. philosophy, grief)"
                      className="w-full bg-black/30 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={!content.trim() || isSaving}
                    className="shrink-0 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-purple-600 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Book className="w-4 h-4" />}
                    {isSaving ? 'Embedding…' : 'Save to Memory'}
                  </button>
                </div>
              </div>

              {/* Entry history */}
              <div>
                <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">
                  Recent Entries
                </h2>
                {isLoadingEntries ? (
                  <div className="flex items-center justify-center py-12 text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading entries…
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary bg-midnight-surface/50 border border-white/5 rounded-2xl">
                    <Book className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No entries yet. Write your first memory above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map(entry => (
                      <motion.article
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-midnight-surface/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                            {entry.embedding && (
                              <span
                                className="ml-2 text-[10px] bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-1.5 py-0.5 rounded"
                                title="AI embedding generated — this entry is semantically searchable"
                              >
                                ⚡ Indexed
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-text-primary text-sm leading-relaxed line-clamp-3">
                          {entry.content}
                        </p>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {entry.tags.map(tag => (
                              <span key={tag} className="flex items-center gap-1 text-[11px] bg-white/5 text-text-secondary px-2 py-0.5 rounded-full">
                                <Hash className="w-2.5 h-2.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.article>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Search tab ────────────────────────────────────────────────── */}
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-cyan" />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-cyan animate-spin" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search by meaning — e.g. "when I felt lost and a story changed me"`}
                  className="w-full bg-midnight-surface border border-accent-cyan/30 rounded-2xl py-4 pl-12 pr-12 text-text-primary placeholder-text-muted focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 outline-none text-base shadow-[0_0_20px_rgba(6,182,212,0.08)]"
                />
              </div>

              {/* Results */}
              <AnimatePresence>
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-text-muted uppercase tracking-widest font-bold">
                      {searchResults.length} semantic match{searchResults.length !== 1 ? 'es' : ''}
                    </p>
                    {searchResults.map((result, i) => (
                      <motion.article
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-midnight-surface border border-white/5 rounded-2xl p-6 hover:border-accent-cyan/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-text-muted flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(result.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 rounded-full">
                            {(result.score * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="text-text-primary text-sm leading-relaxed">{result.content}</p>
                        {result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {result.tags.map(tag => (
                              <span key={tag} className="flex items-center gap-1 text-[11px] bg-white/5 text-text-secondary px-2 py-0.5 rounded-full">
                                <Hash className="w-2.5 h-2.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.article>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-text-secondary bg-midnight-surface/50 border border-white/5 rounded-2xl"
                  >
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No conceptual matches found. Try a different phrase.</p>
                  </motion.div>
                ) : !searchQuery ? (
                  <div className="text-center py-16 text-text-secondary bg-midnight-surface/50 border border-white/5 rounded-2xl">
                    <p className="text-sm">Type any thought above to search your journal by meaning.</p>
                  </div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
