import { jsonResponse, proxyJsonGet, validateRelativePath } from './_lib/proxy';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = validateRelativePath(url.searchParams.get('path'));
  if (!path) return jsonResponse({ error: 'Invalid or missing path parameter' }, 400);

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) return jsonResponse({ error: 'TMDB API key not configured' }, 500);

  const targetUrl = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.forEach((value, key) => {
    if (key !== 'path') targetUrl.searchParams.append(key, value);
  });

  return proxyJsonGet({
    req,
    targetUrl: targetUrl.toString(),
    headers: { Authorization: `Bearer ${TMDB_API_KEY}`, 'Content-Type': 'application/json' },
    errorLabel: 'TMDB Proxy',
  });
}
