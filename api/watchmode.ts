export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;

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

    if (!WATCHMODE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Watchmode API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUrl = new URL(`https://api.watchmode.com/v1${path}`);
    targetUrl.searchParams.set('apiKey', WATCHMODE_API_KEY);
    
    // Forward the search params except 'path'
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        targetUrl.searchParams.append(key, value);
      }
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
    console.error('Watchmode Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
