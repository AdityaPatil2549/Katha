const BASE_URL = '/api/gemini';

// ─── Typed return for the intelligence analysis pipeline ──────────────────────
export interface KathaIntelligenceResult {
  emotionalJourney: {
    dominantMood: string;
    moodRange: string[];
    emotionalGrowth: { growth: number; trend: string };
    catharticMoments: string[];
  } | null;
  tasteEvolution: {
    genres: { genre: string; current: number; previous: number }[];
    sophisticationScore: number;
    undergroundRatio: number;
    decadePreference: string;
  } | null;
  lifePatterns: {
    viewingHabits: { peakTime: string; consistency: number; bingeTendency: number };
    socialVsSolo: number;
    moodInfluence: string;
  } | null;
  wisdomExtraction: {
    topLessons: { lesson: string; stories: string[]; frequency: number }[];
    philosophyScore: number;
    recurringThemes: string[];
  } | null;
  predictions: {
    nextFavoriteGenre: string;
    emotionalReadiness: string;
    optimalWatchTime: string;
    lifePhaseTransition: string;
  };
}

class GeminiService {
  // ─── Private fetch helper — eliminates boilerplate ──────────────────────────
  private async post<T = any>(action: string, payload: Record<string, unknown>): Promise<T | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Gemini action '${action}' failed: ${response.status}`);
      const data = await response.json();
      return data.result ?? null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Translates text into the requested language.
   */
  async translateText(text: string, targetLanguage = 'English'): Promise<string> {
    try {
      return (await this.post<string>('translate', { text, targetLanguage })) ?? text;
    } catch (error) {
      console.error('Gemini Translation Error:', error);
      return text; // Fallback to original text
    }
  }

  /**
   * Analyzes sentiment and returns 1–3 dominant emotions.
   */
  async analyzeEmotion(text: string): Promise<string[]> {
    try {
      return (await this.post<string[]>('emotion', { text })) ?? [];
    } catch (error) {
      console.error('Gemini Emotion Analysis Error:', error);
      return [];
    }
  }

  /**
   * Extracts tags or objects from a base64 image.
   */
  async analyzeImage(base64Image: string): Promise<string[]> {
    try {
      return (await this.post<string[]>('vision', { base64Image })) ?? [];
    } catch (error) {
      console.error('Gemini Vision Error:', error);
      return [];
    }
  }

  // ─── Private retry helper for critical endpoints ────────────────────────────
  private async retryPost<T = any>(action: string, payload: Record<string, unknown>, maxRetries = 3): Promise<T | null> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const result = await this.post<T>(action, payload);
        if (result !== null) return result;
        throw new Error('Null result returned');
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error(`Gemini action '${action}' failed after ${maxRetries} attempts:`, error);
          return null;
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
    return null;
  }

  /**
   * Runs 4 specialized sub-analyses in parallel.
   * Each sub-analysis degrades gracefully — a single failure does NOT
   * collapse the entire result. Returns a typed KathaIntelligenceResult.
   */
  async analyzeIntelligence(userData: unknown): Promise<KathaIntelligenceResult | null> {
    try {
      const actions = [
        'analyze_intelligence_emotion',
        'analyze_intelligence_taste',
        'analyze_intelligence_life',
        'analyze_intelligence_wisdom',
      ] as const;

      const settled = await Promise.allSettled(
        actions.map(action =>
          this.retryPost(action, { userData })
        )
      );

      const [emotion, taste, life, wisdom] = settled.map(r =>
        r.status === 'fulfilled' ? r.value : null
      );

      return {
        emotionalJourney: emotion,
        tasteEvolution: taste,
        lifePatterns: life,
        wisdomExtraction: wisdom,
        predictions: {
          nextFavoriteGenre: 'Unknown',
          emotionalReadiness: 'High',
          optimalWatchTime: 'Evening',
          lifePhaseTransition: 'Approaching',
        },
      };
    } catch (error) {
      console.error('Gemini Intelligence Analysis Error:', error);
      return null;
    }
  }

  /**
   * Generates a poetic "Spotify Wrapped"-style summary of the user's media journey.
   */
  async synthesizeMemory(userData: unknown): Promise<string | null> {
    try {
      return await this.retryPost<string>('synthesize_memory', { userData });
    } catch (error) {
      console.error('Gemini Memory Synthesis Error:', error);
      return null;
    }
  }

  /**
   * Generates natural language reasoning for why a set of recommendations was chosen.
   */
  async generateReasoning(context: unknown): Promise<{ reasoning: string, alternatives: string[] } | null> {
    try {
      const result = await this.retryPost<{ reasoning?: string, alternatives?: string[] }>('generate_reasoning', { context });
      if (!result || typeof result !== 'object') return null;
      
      // Strict validation to prevent AI hallucination crashes
      const validReasoning = typeof result.reasoning === 'string' ? result.reasoning : undefined;
      const validAlternatives = Array.isArray(result.alternatives) ? result.alternatives.filter(a => typeof a === 'string') : undefined;
      
      if (!validReasoning || !validAlternatives) return null;
      
      return { reasoning: validReasoning, alternatives: validAlternatives };
    } catch (error) {
      console.error('Gemini Reasoning Error:', error);
      return null;
    }
  }

  /**
   * Generates a vector embedding to enable semantic search.
   * Gemini embeddings are L2-normalized, so the raw dot product
   * between two embeddings equals their cosine similarity.
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      return await this.post<number[]>('generate_embedding', { text });
    } catch (error) {
      console.error('Gemini Embedding Error:', error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
