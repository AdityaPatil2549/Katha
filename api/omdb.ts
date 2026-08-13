import { checkRateLimit, rateLimitResponse } from './_lib/rate-limit';
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const limitCheck = checkRateLimit(req, 60, 60); // 60 requests per 60s
    if (!limitCheck.success) return rateLimitResponse(limitCheck.ip);

    const url = new URL(req.url);
    const OMDB_API_KEY = process.env.OMDB_API_KEY;

    if (!OMDB_API_KEY) {
      return new Response(JSON.stringify({ error: 'OMDB API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUrl = new URL('https://www.omdbapi.com/');
    targetUrl.searchParams.set('apikey', OMDB_API_KEY);
    
    // Forward all search params from the client
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    const response = await fetch(targetUrl.toString());
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('OMDB Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
