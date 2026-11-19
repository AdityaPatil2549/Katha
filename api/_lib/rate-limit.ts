// Isolate-scoped Memory Rate Limiter with trusted-header preference and bounded map size.

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_RATE_LIMIT_ENTRIES = 2000;

export function extractClientIp(req: Request): string {
  const vercelIp = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();
  const realIp = req.headers.get('x-real-ip')?.trim();
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return vercelIp || cfIp || realIp || forwardedFor || 'anonymous-ip';
}

export function checkRateLimit(
  req: Request,
  limit: number = 30,
  windowSeconds: number = 60
): { success: boolean; ip: string } {
  const ip = extractClientIp(req);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitMap.get(ip);

  if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.expiresAt) rateLimitMap.delete(key);
    }
    if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = rateLimitMap.keys().next().value;
      if (oldestKey) rateLimitMap.delete(oldestKey);
    }
  }

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true, ip };
  }

  if (record.count >= limit) {
    return { success: false, ip };
  }

  record.count += 1;
  return { success: true, ip };
}

export function rateLimitResponse(ip: string, retryAfterSeconds: number = 60): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Client ${ip} has exceeded the rate limit. Please wait and try again.`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
        'Cache-Control': 'no-store',
      },
    }
  );
}
