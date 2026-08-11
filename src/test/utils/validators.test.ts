import { describe, it, expect } from 'vitest';
import {
  validateStoryTitle,
  validateQuote,
  validateRating,
  sanitizeHtml
} from '@/utils/validators';

describe('Validators', () => {
  describe('validateStoryTitle', () => {
    it('validates correct title', () => {
      const result = validateStoryTitle('Test Story Title');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects empty title', () => {
      const result = validateStoryTitle('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Story title is required');
    });

    it('rejects whitespace-only title', () => {
      const result = validateStoryTitle('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Story title is required');
    });

    it('rejects too long title', () => {
      const result = validateStoryTitle('a'.repeat(201));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title must be less than 200 characters');
    });
  });

  describe('validateQuote', () => {
    it('validates correct quote', () => {
      const result = validateQuote('This is a test quote');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects empty quote', () => {
      const result = validateQuote('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Quote is required');
    });

    it('rejects too long quote', () => {
      const result = validateQuote('a'.repeat(501));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Quote must be less than 500 characters');
    });
  });

  describe('validateRating', () => {
    it('validates correct rating', () => {
      expect(validateRating(5).isValid).toBe(true);
      expect(validateRating(0).isValid).toBe(true);
      expect(validateRating(10).isValid).toBe(true);
    });

    it('rejects negative rating', () => {
      const result = validateRating(-1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Rating must be between 0 and 10');
    });

    it('rejects rating above 10', () => {
      const result = validateRating(11);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Rating must be between 0 and 10');
    });
  });

  describe('sanitizeHtml', () => {
    it('removes dangerous HTML', () => {
      const dangerousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeHtml(dangerousHtml);
      expect(sanitized).toBe('<p>Safe content</p>');
    });

    it('keeps safe HTML', () => {
      const safeHtml = '<p>Safe content</p><strong>Bold text</strong>';
      const sanitized = sanitizeHtml(safeHtml);
      expect(sanitized).toBe('<p>Safe content</p><strong>Bold text</strong>');
    });

    it('handles empty string', () => {
      const sanitized = sanitizeHtml('');
      expect(sanitized).toBe('');
    });
  });
});
