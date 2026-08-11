import { useState } from 'react';
import { motion } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Download, FileText, Clock } from 'lucide-react';
import { dbService } from '@/db/DatabaseService';

interface ExportItem {
  format: string;
  date: string;
  size: string;
  status: string;
}

export function ExportSystemPage() {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const exportHistory: ExportItem[] = [
    { format: 'pdf', date: 'Jan 15, 2024', size: '2.4 MB', status: 'completed' },
    { format: 'word', date: 'Jan 14, 2024', size: '1.8 MB', status: 'completed' },
    { format: 'json', date: 'Jan 13, 2024', size: '856 KB', status: 'completed' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let dataStr = '';
      let filename = '';
      let mimeType = '';

      if (selectedFormat === 'json') {
        const data = {
          stories: await dbService.stories.findAll(),
          moments: await dbService.moments.findAll(),
          sessions: await dbService.sessions.findAll(),
          knowledge: await dbService.knowledge.findAll(),
          timeline: await dbService.timeline.findAll(),
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        };
        dataStr = JSON.stringify(data, null, 2);
        filename = `katha-backup-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        const stories = await dbService.stories.findAll();
        dataStr = `# Katha Export\n\n`;
        stories.forEach(s => {
           dataStr += `## ${s.title}\nCategory: ${s.category}\nStatus: ${s.status}\n\n`;
        });
        filename = `katha-export-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
      }

      const blob = new Blob([dataStr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-midnight">
      <StaggerContainer>
      <div className="max-w-6xl mx-auto p-page">
        <BlurReveal>
        <div className="mb-page">
          <h1 className="heading-1 text-primary mb-2">Export System</h1>
          <p className="text-secondary">Export your stories and memories</p>
        </div>
        </BlurReveal>

        <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-section">
          <div className="lg:col-span-2 space-y-section">
            <div className="surface-elevated rounded-card p-6">
              <h2 className="heading-2 text-primary mb-section">Export Format</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'pdf', name: 'PDF Document' },
                  { id: 'word', name: 'Word Document' },
                  { id: 'json', name: 'JSON Backup' }
                ].map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-card border-2 transition-all ${
                      selectedFormat === format.id
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-midnight-border hover:border-midnight-divider'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-accent-primary" />
                    <h3 className="font-medium text-primary">{format.name}</h3>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn btn-primary btn-lg px-8 py-3 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export Now'}
              </button>
            </div>
          </div>

          <div className="surface-elevated rounded-card p-6">
            <h3 className="heading-3 text-primary mb-section flex items-center gap-tight">
              <Clock className="w-5 h-5 text-accent-primary" />
              Recent Exports
            </h3>
            <div className="space-y-3">
              {exportHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-midnight-surface rounded-card">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-accent-primary" />
                    <div>
                      <div className="font-medium text-primary capitalize">{item.format}</div>
                      <div className="text-xs text-secondary">{item.date} • {item.size}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip chip-emerald chip-accent text-xs">
                      {item.status}
                    </span>
                    <button onClick={() => {
                      const a = document.createElement('a');
                      a.href = '#'; // In a real app this would be the blob url
                      a.download = `katha-export.json`;
                      a.click();
                      alert('Download started!');
                    }} className="btn btn-ghost p-2" title="Download again">
                      <Download className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </FadeIn>
      </div>
      </StaggerContainer>
    </div>
  );
}
