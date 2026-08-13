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

    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
      return new Response(JSON.stringify({ error: 'TMDB API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tmdbUrl = `https://api.themoviedb.org/3${path}`;
    
    // Forward the search params except 'path'
    const targetUrl = new URL(tmdbUrl);
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        targetUrl.searchParams.append(key, value);
      }
    });

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
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
    console.error('TMDB Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
