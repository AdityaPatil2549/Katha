import { describe, it, expect } from 'vitest';
import { validateRelativePath, jsonResponse } from '../../../api/_lib/proxy';
import { checkRateLimit, rateLimitResponse } from '../../../api/_lib/rate-limit';

describe('API proxy security & rate-limit helpers', () => {
  it('validates clean API relative paths and blocks traversal/SSRF bypasses', () => {
    expect(validateRelativePath('/movie/550?language=en-US')).toBe('/movie/550?language=en-US');
    expect(validateRelativePath('/../etc/passwd')).toBeNull();
    expect(validateRelativePath('//evil.example.com/hook')).toBeNull();
    expect(validateRelativePath('/%2e%2e/secret')).toBeNull();
    expect(validateRelativePath('/user@evil.com/path')).toBeNull();
    expect(validateRelativePath('/bad\\slash')).toBeNull();
    expect(validateRelativePath('movie/550')).toBeNull();
    expect(validateRelativePath(null)).toBeNull();
  });

  it('builds JSON responses with strict content-type and cache headers', async () => {
    const res = jsonResponse({ ok: true }, 200, 'public, s-maxage=3600');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(res.headers.get('Cache-Control')).toBe('public, s-maxage=3600');
    expect(await res.json()).toEqual({ ok: true });
  });

  it('enforces per-IP rate limiting and formats 429 response', () => {
    const req = new Request('https://katha.local/api/tmdb', {
      headers: { 'x-vercel-forwarded-for': '203.0.113.42' },
    });

    expect(checkRateLimit(req, 2, 60).success).toBe(true);
    expect(checkRateLimit(req, 2, 60).success).toBe(true);
    const blocked = checkRateLimit(req, 2, 60);
    expect(blocked.success).toBe(false);

    const resp = rateLimitResponse(blocked.ip, 30);
    expect(resp.status).toBe(429);
    expect(resp.headers.get('Retry-After')).toBe('30');
    expect(resp.headers.get('Cache-Control')).toBe('no-store');
  });
});

