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

    if (action === 'analyze_intelligence') {
      const { userData } = body;
      const prompt = `You are the Smriti Intelligence Engine. Analyze the following user data (stories they've interacted with, life moments logged, and extracted knowledge/lessons). 
Calculate and infer deep insights about their emotional journey, taste evolution, life patterns, and extract wisdom.
Return ONLY a strictly formatted JSON object that precisely matches this structure, with no markdown wrappers or additional text:
{
  "emotionalJourney": {
    "dominantMood": "inspired|emotional|thoughtful|melancholic|joyful",
    "moodEvolution": [
      { "month": "Jan", "moods": { "inspired": 40, "emotional": 30, "thoughtful": 30 } },
      ... (last 6 months, percentages must add up to 100 for each month)
    ],
    "emotionalGrowth": { "current": 85, "previous": 70, "growth": 15 }
  },
  "tasteEvolution": {
    "genres": [
      { "genre": "string", "current": 35, "previous": 25, "trend": "up|down|stable" },
      ... (top 5 genres)
    ],
    "sophisticationScore": 0-100,
    "diversityIndex": 0.0-1.0
  },
  "lifePatterns": {
    "viewingHabits": {
      "peakTime": "string",
      "averageSession": "X hours",
      "bingeTendency": 0.0-1.0,
      "consistency": 0.0-1.0
    },
    "lifePhaseCorrelation": {
      "phase-name": { "stories": number, "avgRating": number, "dominantMood": "string" }
      ... (2 to 3 phases)
    }
  },
  "wisdomExtraction": {
    "totalLessons": number,
    "topLessons": [
      { "lesson": "string", "frequency": number, "stories": ["string"] }
      ... (top 4 lessons)
    ],
    "personalPrinciples": [
      { "principle": "string", "strength": 0.0-1.0, "source": "string" }
      ... (top 3 principles)
    ]
  },
  "predictions": {
    "nextFavoriteGenre": "string",
    "emotionalReadiness": "string",
    "optimalWatchTime": "string",
    "lifePhaseTransition": "string"
  }
}

User Data:
${JSON.stringify(userData, null, 2)}`;
      
      const jsonModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const result = await jsonModel.generateContent(prompt);
      const textResponse = result.response.text();
      try {
        const parsedData = JSON.parse(textResponse);
        return new Response(JSON.stringify({ result: parsedData }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse JSON from Gemini:', textResponse);
        throw parseError;
      }
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
