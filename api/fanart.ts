import { jsonResponse, proxyJsonGet } from './_lib/proxy';

export const config = { runtime: 'edge' };

const ALLOWED_TYPES = new Set(['movies', 'tv']);
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,32}$/;

export default async function handler(req: Request) {
  const FANART_API_KEY = process.env.FANART_API_KEY;
  if (!FANART_API_KEY) return jsonResponse({ error: 'FANART API key not configured' }, 500);

  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');

  if (!type || !ALLOWED_TYPES.has(type) || !id || !SAFE_ID_PATTERN.test(id)) {
    return jsonResponse({ error: 'Invalid type or id parameter' }, 400);
  }

  const targetUrl = new URL(`https://webservice.fanart.tv/v3/${encodeURIComponent(type)}/${encodeURIComponent(id)}`);
  targetUrl.searchParams.set('api_key', FANART_API_KEY);

  return proxyJsonGet({
    req,
    targetUrl: targetUrl.toString(),
    errorLabel: 'Fanart Proxy',
  });
}
