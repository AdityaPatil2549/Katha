import { checkRateLimit, rateLimitResponse } from './_lib/rate-limit';
import { jsonResponse } from './_lib/proxy';

export const config = { runtime: 'edge' };

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,32}$/;

export default async function handler(req: Request) {
  const limitCheck = checkRateLimit(req, 60, 60);
  if (!limitCheck.success) return rateLimitResponse(limitCheck.ip, 60);

  const MDBLIST_API_KEY = process.env.MDBLIST_API_KEY;
  if (!MDBLIST_API_KEY) return jsonResponse({ error: 'MDBLIST API key not configured' }, 500);

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const m = url.searchParams.get('m');
  const t = url.searchParams.get('t');

  if (!id && !m && !t) return jsonResponse({ error: 'Missing id parameters' }, 400);

  const targetUrl = new URL('https://mdblist.com/api/');
  targetUrl.searchParams.set('apikey', MDBLIST_API_KEY);

  if (m && SAFE_ID_PATTERN.test(m)) {
    targetUrl.searchParams.set('tm', m);
  } else if (t && SAFE_ID_PATTERN.test(t)) {
    targetUrl.searchParams.set('tv', t);
  } else if (id && SAFE_ID_PATTERN.test(id)) {
    targetUrl.searchParams.set(id.startsWith('tt') ? 'i' : 'tm', id);
  } else {
    return jsonResponse({ error: 'Invalid id format' }, 400);
  }

  try {
    const response = await fetch(targetUrl.toString());
    const data = (await response.json()) as { response?: string; error?: unknown };
    if (data.response === 'False' || data.error) {
      return jsonResponse(data, 404, 'no-store');
    }
    const cacheControl = response.ok ? 'public, s-maxage=86400, stale-while-revalidate=43200' : 'no-store';
    return jsonResponse(data, response.status, cacheControl);
  } catch (error) {
    console.error('MDBList Proxy Error:', error);
    return jsonResponse({ error: 'Internal Server Error' }, 500, 'no-store');
  }
}
