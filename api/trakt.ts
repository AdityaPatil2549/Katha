import { jsonResponse, proxyJsonGet, validateRelativePath } from './_lib/proxy';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = validateRelativePath(url.searchParams.get('path'));
  if (!path) return jsonResponse({ error: 'Invalid or missing path parameter' }, 400);

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  if (!TRAKT_CLIENT_ID) return jsonResponse({ error: 'Trakt client ID not configured' }, 500);

  const targetUrl = new URL(`https://api.trakt.tv${path}`);
  url.searchParams.forEach((value, key) => {
    if (key !== 'path') targetUrl.searchParams.append(key, value);
  });

  return proxyJsonGet({
    req,
    targetUrl: targetUrl.toString(),
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': TRAKT_CLIENT_ID,
    },
    cacheSeconds: 3600,
    errorLabel: 'Trakt Proxy',
  });
}
