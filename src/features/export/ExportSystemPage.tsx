import { useState } from 'react';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Download, FileText, Clock } from 'lucide-react';
import { dbService } from '@/db/DatabaseService';
import { useToastStore } from '@/store/toastStore';
import {
  exportArchiveToJSON,
  exportArchiveToMarkdown,
  exportArchiveToPDF,
  exportArchiveToWord,
  triggerBlobDownload,
  type KathaArchiveExport,
} from '@/utils/exporters';

type ExportFormat = 'pdf' | 'word' | 'markdown' | 'json';

interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  filename: string;
  date: string;
  size: string;
  storyCount: number;
}

const HISTORY_KEY = 'katha_export_history';

function readExportHistory(): ExportHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExportHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExportSystemPage() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>(() => readExportHistory());
  const addToast = useToastStore((s) => s.addToast);

  const buildArchiveSnapshot = async (): Promise<KathaArchiveExport> => ({
    stories: await dbService.stories.findAll(),
    moments: await dbService.moments.findAll(),
    sessions: await dbService.sessions.findAll(),
    knowledge: await dbService.knowledge.findAll(),
    timeline: await dbService.timeline.findAll(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  });

  const generateForFormat = async (format: ExportFormat): Promise<{ blob: Blob; filename: string; storyCount: number }> => {
    const archive = await buildArchiveSnapshot();
    const dateStamp = archive.exportedAt.split('T')[0];

    if (format === 'json') {
      return {
        blob: new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' }),
        filename: `katha-backup-${dateStamp}.json`,
        storyCount: archive.stories.length,
      };
    }
    if (format === 'word') {
      return {
        blob: await exportArchiveToWord(archive),
        filename: `katha-archive-${dateStamp}.docx`,
        storyCount: archive.stories.length,
      };
    }
    if (format === 'markdown') {
      return {
        blob: exportArchiveToMarkdown(archive),
        filename: `katha-archive-${dateStamp}.md`,
        storyCount: archive.stories.length,
      };
    }
    return {
      blob: exportArchiveToPDF(archive),
      filename: `katha-archive-${dateStamp}.pdf`,
      storyCount: archive.stories.length,
    };
  };

  const handleExport = async (format: ExportFormat = selectedFormat) => {
    setIsExporting(true);
    try {
      const { blob, filename, storyCount } = await generateForFormat(format);
      triggerBlobDownload(blob, filename);

      const entry: ExportHistoryItem = {
        id: `${Date.now()}`,
        format,
        filename,
        date: new Date().toLocaleDateString(),
        size: formatBytes(blob.size),
        storyCount,
      };

      const nextHistory = [entry, ...exportHistory].slice(0, 10);
      setExportHistory(nextHistory);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      } catch {
        // Ignore quota error
      }
      addToast({ type: 'success', message: `Exported ${filename} (${entry.size})` });
    } catch (error) {
      console.error('Export failed', error);
      addToast({ type: 'error', message: 'Failed to export archive. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <StaggerContainer>
        <div className="max-w-6xl mx-auto p-page">
          <BlurReveal>
            <div className="mb-page">
              <h1 className="heading-1 text-text-primary mb-2">Export System</h1>
              <p className="text-text-secondary">
                Generate portable archives of your stories, quotes, sessions, and lessons.
              </p>
            </div>
          </BlurReveal>

          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-section">
              <div className="lg:col-span-2 space-y-section">
                <div className="surface-elevated rounded-card p-6">
                  <h2 className="heading-2 text-text-primary mb-section">Export Format</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(
                      [
                        { id: 'pdf', name: 'PDF Book (.pdf)' },
                        { id: 'word', name: 'Word (.docx)' },
                        { id: 'markdown', name: 'Markdown (.md)' },
                        { id: 'json', name: 'JSON Backup (.json)' },
                      ] as const
                    ).map((format) => (
                      <button
                        type="button"
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        aria-pressed={selectedFormat === format.id}
                        className={`p-4 rounded-card border-2 transition-all text-center ${
                          selectedFormat === format.id
                            ? 'border-accent-primary bg-accent-primary/10 text-text-primary'
                            : 'border-midnight-border text-text-secondary hover:border-text-muted hover:text-text-primary'
                        }`}
                      >
                        <FileText className="w-7 h-7 mx-auto mb-2 text-accent-primary" />
                        <span className="font-medium text-sm">{format.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleExport(selectedFormat)}
                    disabled={isExporting}
                    className="btn btn-primary btn-lg px-8 py-3 disabled:opacity-50"
                  >
                    {isExporting ? 'Generating Archive...' : 'Export Now'}
                  </button>
                </div>
              </div>

              <div className="surface-elevated rounded-card p-6">
                <h3 className="heading-3 text-text-primary mb-section flex items-center gap-tight">
                  <Clock className="w-5 h-5 text-accent-primary" />
                  Export History
                </h3>
                {exportHistory.length === 0 ? (
                  <p className="text-sm text-text-muted py-6 text-center">
                    No exports generated yet in this browser.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {exportHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 bg-midnight-bg/60 border border-midnight-border rounded-card"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-accent-primary shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-text-primary truncate">{item.filename}</div>
                            <div className="text-xs text-text-muted">
                              {item.date} • {item.size} • {item.storyCount} stories
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExport(item.format)}
                          disabled={isExporting}
                          aria-label={`Regenerate and download ${item.filename}`}
                          className="btn btn-ghost p-2 shrink-0"
                          title="Generate fresh download"
                        >
                          <Download className="w-4 h-4 text-text-primary" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </StaggerContainer>
    </div>
  );
}
