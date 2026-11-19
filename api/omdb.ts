import { jsonResponse, proxyJsonGet } from './_lib/proxy';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const OMDB_API_KEY = process.env.OMDB_API_KEY;
  if (!OMDB_API_KEY) return jsonResponse({ error: 'OMDB API key not configured' }, 500);

  const targetUrl = new URL('https://www.omdbapi.com/');
  targetUrl.searchParams.set('apikey', OMDB_API_KEY);
  url.searchParams.forEach((value, key) => {
    if (key !== 'apikey') targetUrl.searchParams.append(key, value);
  });

  return proxyJsonGet({
    req,
    targetUrl: targetUrl.toString(),
    errorLabel: 'OMDB Proxy',
  });
}
