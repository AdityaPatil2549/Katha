import { checkRateLimit, rateLimitResponse } from './_lib/rate-limit';
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const limitCheck = checkRateLimit(req, 60, 60); // 60 requests per 60s
    if (!limitCheck.success) return rateLimitResponse(limitCheck.ip);

    const url = new URL(req.url);
    const MDBLIST_API_KEY = process.env.MDBLIST_API_KEY;

    if (!MDBLIST_API_KEY) {
      return new Response(JSON.stringify({ error: 'MDBLIST API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = url.searchParams.get('id'); // e.g. tt0111161 or tmdb ID
    const m = url.searchParams.get('m'); // tmdb id can be passed as m
    const t = url.searchParams.get('t'); // tvdb id can be passed as t

    if (!id && !m && !t) {
      return new Response(JSON.stringify({ error: 'Missing id parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine the query parameter based on the type of ID provided
    let queryParam = '';
    if (id) {
      // If it starts with tt, it's an imdb id
      if (id.startsWith('tt')) {
        queryParam = `i=${id}`;
      } else {
        // MDBList takes 'm' for TMDB movie/tv id, or we just pass the IMDB id
        queryParam = `tm=${id}`; // Note: mdblist uses tm= for tmdb id
      }
    }
    
    // Fallbacks if specified explicitly
    if (m) queryParam = `tm=${m}`;
    if (t) queryParam = `tv=${t}`;

    const targetUrl = `https://mdblist.com/api/?apikey=${MDBLIST_API_KEY}&${queryParam}`;

    const response = await fetch(targetUrl);
    const data = await response.json();
    
    if (data.response === 'False' || data.error) {
      return new Response(JSON.stringify(data), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('MDBList Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
