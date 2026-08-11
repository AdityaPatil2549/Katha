import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatDuration,
  formatWatchTime,
  formatRating,
  formatProgress,
  formatFileSize
} from '@/utils/formatters';

describe('Formatters', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = '2024-01-15T10:30:00Z';
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });
  });

  describe('formatDateTime', () => {
    it('formats date with time correctly', () => {
      const date = '2024-01-15T10:30:00Z';
      expect(formatDateTime(date)).toBe('Jan 15, 2024 10:30');
    });
  });

  describe('formatTimeAgo', () => {
    it('formats relative time correctly', () => {
      const date = new Date();
      date.setHours(date.getHours() - 2);
      expect(formatTimeAgo(date)).toMatch(/about 2 hours ago/);
    });
  });

  describe('formatDuration', () => {
    it('formats minutes correctly', () => {
      expect(formatDuration(30)).toBe('30m');
    });

    it('formats hours and minutes correctly', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });

    it('formats only hours correctly', () => {
      expect(formatDuration(120)).toBe('2h');
    });
  });

  describe('formatWatchTime', () => {
    it('formats minutes correctly', () => {
      expect(formatWatchTime(45)).toBe('45 minutes');
    });

    it('formats hours correctly', () => {
      expect(formatWatchTime(120)).toBe('2h 0m');
    });

    it('formats days and hours correctly', () => {
      expect(formatWatchTime(25 * 60 + 8)).toBe('1d 8h');
    });
  });

  describe('formatRating', () => {
    it('formats rating with one decimal', () => {
      expect(formatRating(8.5)).toBe('8.5');
      expect(formatRating(8)).toBe('8.0');
    });
  });

  describe('formatProgress', () => {
    it('calculates progress percentage correctly', () => {
      expect(formatProgress(5, 10)).toBe('50%');
      expect(formatProgress(0, 10)).toBe('0%');
      expect(formatProgress(10, 10)).toBe('100%');
    });

    it('handles zero total correctly', () => {
      expect(formatProgress(5, 0)).toBe('0%');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });
});
