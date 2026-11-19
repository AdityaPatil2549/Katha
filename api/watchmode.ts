import { jsonResponse, proxyJsonGet, validateRelativePath } from './_lib/proxy';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = validateRelativePath(url.searchParams.get('path'));
  if (!path) return jsonResponse({ error: 'Invalid or missing path parameter' }, 400);

  const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
  if (!WATCHMODE_API_KEY) return jsonResponse({ error: 'Watchmode API key not configured' }, 500);

  const targetUrl = new URL(`https://api.watchmode.com/v1${path}`);
  url.searchParams.forEach((value, key) => {
    if (key !== 'path' && key !== 'apiKey') targetUrl.searchParams.append(key, value);
  });
  targetUrl.searchParams.set('apiKey', WATCHMODE_API_KEY);

  return proxyJsonGet({
    req,
    targetUrl: targetUrl.toString(),
    errorLabel: 'Watchmode Proxy',
  });
}
