import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from '@/services/GeminiService';

// Mock the global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch as any;

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeEmotion', () => {
    it('returns dominant emotions when the API succeeds', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: ['inspired', 'joyful'] }),
      });

      const result = await geminiService.analyzeEmotion('This is a great story!');
      expect(result).toEqual(['inspired', 'joyful']);
      expect(globalFetch).toHaveBeenCalledTimes(1);
      
      const requestArgs = globalFetch.mock.calls[0] as any[];
      expect(requestArgs[0]).toBe('/api/gemini');
      expect(JSON.parse(requestArgs[1].body)).toEqual({
        action: 'emotion',
        text: 'This is a great story!'
      });
    });

    it('returns an empty array and handles errors gracefully when the API fails', async () => {
      globalFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await geminiService.analyzeEmotion('This is a great story!');
      expect(result).toEqual([]);
      expect(globalFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('synthesizeMemory', () => {
    it('returns the memory string after successful retry', async () => {
      // First attempt fails, second succeeds
      globalFetch
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: 'Your cinematic journey...' }),
        });

      const result = await geminiService.synthesizeMemory({ test: 'data' });
      
      expect(result).toBe('Your cinematic journey...');
      expect(globalFetch).toHaveBeenCalledTimes(2);
    });

    it('returns null if max retries are exceeded', async () => {
      // All 3 attempts fail
      globalFetch.mockRejectedValue(new Error('Timeout'));

      const result = await geminiService.synthesizeMemory({ test: 'data' });
      
      expect(result).toBeNull();
      expect(globalFetch).toHaveBeenCalledTimes(3);
    });
  });
});
