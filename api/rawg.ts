import { jsonResponse, proxyJsonGet, validateRelativePath } from './_lib/proxy';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = validateRelativePath(url.searchParams.get('path'));
  if (!path) return jsonResponse({ error: 'Invalid or missing path parameter' }, 400);

  const RAWG_API_KEY = process.env.RAWG_API_KEY;
  if (!RAWG_API_KEY) return jsonResponse({ error: 'RAWG API key not configured' }, 500);

  const targetUrl = new URL(`https://api.rawg.io/api${path}`);
  url.searchParams.forEach((value, key) => {
    if (key !== 'path' && key !== 'key') targetUrl.searchParams.append(key, value);
  });
  targetUrl.searchParams.set('key', RAWG_API_KEY);

  return proxyJsonGet({
    req,
    targetUrl: targetUrl.toString(),
    headers: { 'Content-Type': 'application/json' },
    errorLabel: 'RAWG Proxy',
  });
}
