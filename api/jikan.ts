import { jsonResponse, proxyJsonGet, validateRelativePath } from './_lib/proxy';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = validateRelativePath(url.searchParams.get('path'));
  if (!path) return jsonResponse({ error: 'Invalid or missing path parameter' }, 400);

  const targetUrl = new URL(`https://api.jikan.moe/v4${path}`);
  url.searchParams.forEach((value, key) => {
    if (key !== 'path') targetUrl.searchParams.append(key, value);
  });

  return proxyJsonGet({
    req,
    targetUrl: targetUrl.toString(),
    errorLabel: 'Jikan Proxy',
  });
}
