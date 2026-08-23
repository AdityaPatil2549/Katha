import { checkRateLimit, rateLimitResponse } from './_lib/rate-limit';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const limitCheck = checkRateLimit(req, 60, 60); // 60 requests per 60s
    if (!limitCheck.success) return rateLimitResponse(limitCheck.ip);

    const url = new URL(req.url);
    const path = url.searchParams.get('path');

    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Basic SSRF protection: Ensure path is relative and doesn't attempt directory traversal
    if (!path.startsWith('/') || path.includes('../') || path.includes('//')) {
      return new Response(JSON.stringify({ error: 'Invalid path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) {
      return new Response(JSON.stringify({ error: 'RAWG API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rawgUrl = `https://api.rawg.io/api${path}`;
    
    // Forward the search params except 'path'
    const targetUrl = new URL(rawgUrl);
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        targetUrl.searchParams.append(key, value);
      }
    });

    // Add the API key
    targetUrl.searchParams.append('key', RAWG_API_KEY);

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    // Add caching headers: cache for 24 hours on Vercel's Edge Network, 1 hour in browser
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('RAWG Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
