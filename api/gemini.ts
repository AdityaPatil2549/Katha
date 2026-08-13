import { checkRateLimit, rateLimitResponse } from './_lib/rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const limitCheck = checkRateLimit(req, 60, 60); // 60 requests per 60s
    if (!limitCheck.success) return rateLimitResponse(limitCheck.ip);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, text, targetLanguage, base64Image } = body;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (action === 'translate') {
      const prompt = `Translate the following text into ${targetLanguage || 'English'}. Provide ONLY the translation, nothing else.\n\nText: ${text}`;
      const result = await model.generateContent(prompt);
      return new Response(JSON.stringify({ result: result.response.text().trim() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'emotion') {
      const prompt = `Analyze the emotional sentiment of the following text. 
Return exactly 1 to 3 lowercase words that best describe the dominant emotions (e.g. joyful, melancholic, inspired, angry, nostalgic).
Format the output as a comma-separated list. Provide ONLY the list, nothing else.

Text: ${text}`;
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const emotions = textResponse.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
      return new Response(JSON.stringify({ result: emotions }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'vision') {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const prompt = `Analyze this image. What are the key objects, themes, or concepts shown?
Return exactly 3 to 5 lowercase words or short phrases that act as tags.
Format the output as a comma-separated list. Provide ONLY the list, nothing else.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          }
        }
      ]);
      const textResponse = result.response.text();
      const tags = textResponse.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
      return new Response(JSON.stringify({ result: tags }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'analyze_intelligence_emotion') {
      const prompt = `Analyze the user data (stories, life moments). Extract deep insights about their emotional journey.
Return strictly formatted JSON:
{
  "dominantMood": "inspired|emotional|thoughtful|melancholic|joyful",
  "moodEvolution": [ { "month": "Jan", "moods": { "inspired": 40, "emotional": 30, "thoughtful": 30 } } ],
  "emotionalGrowth": { "current": 85, "previous": 70, "growth": 15 }
}
User Data: ${JSON.stringify(body.userData, null, 2)}`;
      const jsonModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const result = await jsonModel.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return new Response(JSON.stringify({ result: JSON.parse(cleanJson) }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'analyze_intelligence_taste') {
      const prompt = `Analyze the user data. Extract deep insights about their taste evolution.
Return strictly formatted JSON:
{
  "genres": [ { "genre": "string", "current": 35, "previous": 25, "trend": "up|down|stable" } ],
  "sophisticationScore": 80,
  "diversityIndex": 0.85
}
User Data: ${JSON.stringify(body.userData, null, 2)}`;
      const jsonModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const result = await jsonModel.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return new Response(JSON.stringify({ result: JSON.parse(cleanJson) }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'analyze_intelligence_life') {
      const prompt = `Analyze the user data. Extract deep insights about their life patterns.
Return strictly formatted JSON:
{
  "viewingHabits": { "peakTime": "string", "averageSession": "X hours", "bingeTendency": 0.5, "consistency": 0.8 },
  "lifePhaseCorrelation": { "phase-name": { "stories": 10, "avgRating": 4.5, "dominantMood": "string" } }
}
User Data: ${JSON.stringify(body.userData, null, 2)}`;
      const jsonModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const result = await jsonModel.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return new Response(JSON.stringify({ result: JSON.parse(cleanJson) }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'analyze_intelligence_wisdom') {
      const prompt = `Analyze the user data. Extract deep insights about wisdom and life lessons.
Return strictly formatted JSON:
{
  "totalLessons": 50,
  "topLessons": [ { "lesson": "string", "frequency": 5, "stories": ["string"] } ],
  "personalPrinciples": [ { "principle": "string", "strength": 0.9, "source": "string" } ]
}
User Data: ${JSON.stringify(body.userData, null, 2)}`;
      const jsonModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const result = await jsonModel.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return new Response(JSON.stringify({ result: JSON.parse(cleanJson) }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'generate_embedding') {
      const prompt = text;
      const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await embeddingModel.embedContent(prompt);
      return new Response(JSON.stringify({ result: result.embedding.values }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'synthesize_memory') {
      const prompt = `You are a cinematic storyteller creating a "Spotify Wrapped" style summary for the user's year in media.
Based on the provided user data, generate a poetic, philosophical, and deeply emotional 3-paragraph summary of their journey this year.
Focus on the themes they explored, the emotions they felt, and how they grew. Do not use generic phrases. Be profound.
User Data: ${JSON.stringify(body.userData, null, 2)}`;
      const result = await model.generateContent(prompt);
      return new Response(JSON.stringify({ result: result.response.text().trim() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Gemini Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
