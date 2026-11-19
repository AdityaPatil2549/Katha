import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Story, Moment, Session, Knowledge, TimelineEvent } from '@/types/models';

export interface KathaArchiveExport {
  stories: Story[];
  moments: Moment[];
  sessions: Session[];
  knowledge: Knowledge[];
  timeline?: TimelineEvent[];
  exportedAt: string;
  version: string;
}

export const exportArchiveToWord = async (archive: KathaArchiveExport): Promise<Blob> => {
  const sectionsChildren: Paragraph[] = [
    new Paragraph({
      text: 'Katha — Personal Story Archive',
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: `Exported on ${new Date(archive.exportedAt).toLocaleDateString()} • ${archive.stories.length} stories • ${archive.moments.length} moments`,
      heading: HeadingLevel.HEADING_2,
    }),
  ];

  archive.stories.forEach((story) => {
    sectionsChildren.push(
      new Paragraph({
        text: `${story.title} (${story.category})`,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Status: ${story.status} | Rating: ${story.rating ?? '—'}/10 | Impact: ${story.impactIndex ?? '—'}/10`, bold: true }),
        ],
      })
    );

    if (story.notes) {
      sectionsChildren.push(new Paragraph({ text: story.notes }));
    }

    const storyMoments = archive.moments.filter((m) => m.storyId === story.id);
    if (storyMoments.length > 0) {
      sectionsChildren.push(new Paragraph({ text: 'Moments & Quotes', heading: HeadingLevel.HEADING_3 }));
      storyMoments.forEach((m) => {
        if (m.quote) {
          sectionsChildren.push(
            new Paragraph({
              children: [new TextRun({ text: `"${m.quote}"`, italics: true })],
            })
          );
        }
        if (m.thoughts || m.context) {
          sectionsChildren.push(new Paragraph({ text: `${m.context ? `${m.context} — ` : ''}${m.thoughts ?? ''}` }));
        }
      });
    }

    const storyKnowledge = archive.knowledge.filter((k) => k.storyId === story.id);
    if (storyKnowledge.length > 0) {
      sectionsChildren.push(new Paragraph({ text: 'Lessons & Insights', heading: HeadingLevel.HEADING_3 }));
      storyKnowledge.forEach((k) => {
        sectionsChildren.push(new Paragraph({ text: `• ${k.lesson}${k.principle ? ` (${k.principle})` : ''}` }));
      });
    }
  });

  const doc = new Document({
    sections: [{ properties: {}, children: sectionsChildren }],
  });

  return Packer.toBlob(doc);
};

export const exportArchiveToPDF = (archive: KathaArchiveExport): Blob => {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const margin = 16;
  const maxWidth = 210 - margin * 2;
  let y = 20;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > 280) {
      pdf.addPage();
      y = 20;
    }
  };

  pdf.setFont('times', 'bold');
  pdf.setFontSize(22);
  pdf.text('Katha — Personal Story Archive', margin, y);
  y += 9;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(
    `Exported ${new Date(archive.exportedAt).toLocaleDateString()} | ${archive.stories.length} stories | ${archive.moments.length} moments | ${archive.knowledge.length} insights`,
    margin,
    y
  );
  y += 10;

  archive.stories.forEach((story, index) => {
    ensureSpace(24);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(15);
    const titleLines = pdf.splitTextToSize(`${index + 1}. ${story.title}`, maxWidth) as string[];
    pdf.text(titleLines, margin, y);
    y += titleLines.length * 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(
      `Category: ${story.category} | Status: ${story.status} | Rating: ${story.rating ?? '—'}/10`,
      margin,
      y
    );
    y += 6;

    if (story.notes) {
      const noteLines = pdf.splitTextToSize(story.notes, maxWidth) as string[];
      ensureSpace(noteLines.length * 5 + 4);
      pdf.text(noteLines, margin, y);
      y += noteLines.length * 5 + 3;
    }

    const storyMoments = archive.moments.filter((m) => m.storyId === story.id);
    storyMoments.forEach((m) => {
      const text = [m.quote ? `"${m.quote}"` : '', m.thoughts].filter(Boolean).join(' — ');
      if (!text) return;
      const lines = pdf.splitTextToSize(`• ${text}`, maxWidth - 4) as string[];
      ensureSpace(lines.length * 5 + 2);
      pdf.text(lines, margin + 4, y);
      y += lines.length * 5 + 2;
    });

    y += 4;
  });

  if (archive.stories.length === 0) {
    pdf.text('No stories recorded in your vault yet.', margin, y);
  }

  return pdf.output('blob');
};

export const exportArchiveToMarkdown = (archive: KathaArchiveExport): Blob => {
  const lines: string[] = [
    '# Katha — Personal Story Archive',
    '',
    `Exported: ${new Date(archive.exportedAt).toISOString()}`,
    `Stories: ${archive.stories.length} | Moments: ${archive.moments.length} | Insights: ${archive.knowledge.length}`,
    '',
  ];

  archive.stories.forEach((story) => {
    lines.push(`## ${story.title}`);
    lines.push(`- **Category:** ${story.category}`);
    lines.push(`- **Status:** ${story.status}`);
    lines.push(`- **Rating:** ${story.rating ?? '—'}/10`);
    if (story.notes) lines.push(`\n${story.notes}\n`);

    const storyMoments = archive.moments.filter((m) => m.storyId === story.id);
    if (storyMoments.length > 0) {
      lines.push('### Moments');
      storyMoments.forEach((m) => {
        if (m.quote) lines.push(`> "${m.quote}"`);
        if (m.thoughts) lines.push(`- ${m.thoughts}`);
      });
    }
    lines.push('');
  });

  return new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
};

export const exportToWord = async (data: Partial<KathaArchiveExport> & { totalStories?: number }): Promise<Blob> =>
  exportArchiveToWord({
    stories: data.stories ?? [],
    moments: data.moments ?? [],
    sessions: data.sessions ?? [],
    knowledge: data.knowledge ?? [],
    exportedAt: data.exportedAt ?? new Date().toISOString(),
    version: data.version ?? '1.0.0',
  });

export const exportToPDF = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PDF export');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return new Blob([pdf.output('blob')], { type: 'application/pdf' });
};

export const exportArchiveToJSON = (archive: KathaArchiveExport): Blob =>
  exportToJSON(archive);

export const exportToJSON = (data: unknown): Blob => {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
};

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
