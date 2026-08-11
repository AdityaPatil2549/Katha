const BASE_URL = '/api/gemini';

export class GeminiService {
  /**
   * Translates text into the requested language
   */
  async translateText(text: string, targetLanguage: string = 'English'): Promise<string> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate', text, targetLanguage })
      });
      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Gemini Translation Error:', error);
      return text; // Fallback to original text on failure
    }
  }

  /**
   * Analyzes sentiment and returns 1-3 dominant emotions
   */
  async analyzeEmotion(text: string): Promise<string[]> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'emotion', text })
      });
      if (!response.ok) throw new Error('Emotion analysis failed');
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Gemini Emotion Analysis Error:', error);
      return [];
    }
  }

  /**
   * Extracts tags or objects from an image
   */
  async analyzeImage(base64Image: string): Promise<string[]> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vision', base64Image })
      });
      if (!response.ok) throw new Error('Vision analysis failed');
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Gemini Vision Error:', error);
      return [];
    }
  }

  /**
   * Analyzes user intelligence data
   */
  async analyzeIntelligence(userData: any): Promise<any> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_intelligence', userData })
      });
      if (!response.ok) throw new Error('Intelligence analysis failed');
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Gemini Intelligence Analysis Error:', error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
