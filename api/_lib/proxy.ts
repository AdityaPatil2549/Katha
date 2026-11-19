import { checkRateLimit, rateLimitResponse } from './rate-limit';

export function jsonResponse(
  body: unknown,
  status: number = 200,
  cacheControl: string = 'no-store'
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
    },
  });
}

/**
 * Validates that a dynamic relative path cannot escape the upstream base URL
 * via directory traversal, protocol-relative URLs, credentials (@), or backslashes.
 */
export function validateRelativePath(rawPath: string | null): string | null {
  if (!rawPath) return null;
  let decoded = rawPath;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return null;
  }

  if (
    !rawPath.startsWith('/') ||
    !decoded.startsWith('/') ||
    decoded.includes('..') ||
    decoded.includes('//') ||
    decoded.includes('\\') ||
    decoded.includes('@') ||
    /[\r\n\0]/.test(decoded)
  ) {
    return null;
  }

  return rawPath;
}

export interface ProxyFetchOptions {
  req: Request;
  targetUrl: string;
  headers?: Record<string, string>;
  cacheSeconds?: number;
  limit?: number;
  windowSeconds?: number;
  errorLabel: string;
}

export async function proxyJsonGet({
  req,
  targetUrl,
  headers = {},
  cacheSeconds = 86400,
  limit = 60,
  windowSeconds = 60,
  errorLabel,
}: ProxyFetchOptions): Promise<Response> {
  const limitCheck = checkRateLimit(req, limit, windowSeconds);
  if (!limitCheck.success) return rateLimitResponse(limitCheck.ip, windowSeconds);

  try {
    const response = await fetch(targetUrl, { headers });
    const data: unknown = await response.json();
    const cacheControl = response.ok
      ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${Math.floor(cacheSeconds / 2)}`
      : 'no-store';

    return jsonResponse(data, response.status, cacheControl);
  } catch (error) {
    console.error(`${errorLabel} Error:`, error);
    return jsonResponse({ error: 'Internal Server Error' }, 500, 'no-store');
  }
}

/**
 * Verifies Firebase ID token when FIREBASE_WEB_API_KEY / VITE_FIREBASE_API_KEY is configured.
 * Returns { valid: true } or { valid: false, status, error }.
 */
export async function verifyFirebaseBearerToken(req: Request): Promise<{
  valid: boolean;
  uid?: string;
  status?: number;
  error?: string;
}> {
  const apiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    return { valid: true };
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, status: 401, error: 'Authentication required' };
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) {
    return { valid: false, status: 401, error: 'Invalid authentication token' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (!verifyRes.ok) {
      return { valid: false, status: 401, error: 'Invalid or expired Firebase session' };
    }
    const payload = (await verifyRes.json()) as { users?: Array<{ localId?: string }> };
    const uid = payload.users?.[0]?.localId;
    if (!uid) {
      return { valid: false, status: 401, error: 'Unauthenticated user' };
    }
    return { valid: true, uid };
  } catch {
    return { valid: false, status: 503, error: 'Unable to verify authentication session' };
  }
}

