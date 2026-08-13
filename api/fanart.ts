import { checkRateLimit, rateLimitResponse } from './_lib/rate-limit';
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const limitCheck = checkRateLimit(req, 60, 60); // 60 requests per 60s
    if (!limitCheck.success) return rateLimitResponse(limitCheck.ip);

    const url = new URL(req.url);
    const FANART_API_KEY = process.env.FANART_API_KEY;

    if (!FANART_API_KEY) {
      return new Response(JSON.stringify({ error: 'FANART API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const type = url.searchParams.get('type'); // 'movies' or 'tv'
    const id = url.searchParams.get('id');

    if (!type || !id) {
      return new Response(JSON.stringify({ error: 'Missing type or id parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUrl = `https://webservice.fanart.tv/v3/${type}/${id}?api_key=${FANART_API_KEY}`;

    const response = await fetch(targetUrl);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Fanart Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
