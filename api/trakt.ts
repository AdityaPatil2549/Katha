export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;

    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Basic SSRF protection
    if (!path.startsWith('/') || path.includes('../') || path.includes('//')) {
      return new Response(JSON.stringify({ error: 'Invalid path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!TRAKT_CLIENT_ID) {
      return new Response(JSON.stringify({ error: 'Trakt client ID not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUrl = new URL(`https://api.trakt.tv${path}`);
    
    // Forward the search params except 'path'
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        targetUrl.searchParams.append(key, value);
      }
    });

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID,
      },
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800', // Trakt trending changes often
      },
    });
  } catch (error) {
    console.error('Trakt Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
