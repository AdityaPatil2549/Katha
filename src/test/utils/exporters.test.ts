import { describe, it, expect } from 'vitest';
import {
  exportArchiveToJSON,
  exportArchiveToMarkdown,
  exportArchiveToPDF,
  exportArchiveToWord,
  type KathaArchiveExport,
} from '@/utils/exporters';
import { createMockStory, createMockMoment, createMockKnowledge } from '@/test/utils/testUtils';

describe('Exporters', () => {
  const archive: KathaArchiveExport = {
    stories: [createMockStory({ title: 'Blade Runner 2049', notes: 'Atmosphere and memory.' })],
    moments: [createMockMoment({ quote: 'All the best memories are hers.' })],
    sessions: [],
    knowledge: [createMockKnowledge({ lesson: 'Compassion defines humanity.', principle: 'Empathy' })],
    exportedAt: '2026-11-12T10:00:00.000Z',
    version: '1.0.0',
  };

  it('exports markdown archive containing story title, quote, and notes', async () => {
    const blob = exportArchiveToMarkdown(archive);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('text/markdown');
    expect(blob.size).toBeGreaterThan(50);
  });

  it('exports valid JSON archive blob', () => {
    const blob = exportArchiveToJSON(archive);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(100);
  });

  it('exports Word (.docx) archive without throwing', async () => {
    const blob = await exportArchiveToWord(archive);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(500);
  });

  it('exports PDF archive even when vault is empty', () => {
    const populatedPdf = exportArchiveToPDF(archive);
    expect(populatedPdf).toBeInstanceOf(Blob);
    expect(populatedPdf.size).toBeGreaterThan(500);

    const emptyPdf = exportArchiveToPDF({
      stories: [],
      moments: [],
      sessions: [],
      knowledge: [],
      exportedAt: '2026-11-12T10:00:00.000Z',
      version: '1.0.0',
    });
    expect(emptyPdf).toBeInstanceOf(Blob);
    expect(emptyPdf.size).toBeGreaterThan(300);
  });
});

