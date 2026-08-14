// Isolate-scoped Memory Rate Limiter
// Note: This relies on the memory of the Vercel Edge isolate.
// It resets when the isolate goes to sleep, and limits apply per-region.
// It is a pragmatic, free way to stop massive script-kiddie abuse.

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(req: Request, limit: number = 30, windowSeconds: number = 60): { success: boolean, ip: string } {
  // Extract IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor ? (forwardedFor.split(',')[0]?.trim() || 'anonymous-ip') : (realIp || 'anonymous-ip');

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitMap.get(ip);
  
  // Cleanup old records to prevent memory leaks (runs on every 100th request probabilistically)
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.expiresAt) rateLimitMap.delete(key);
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

export function rateLimitResponse(ip: string): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Too Many Requests', 
      message: `IP ${ip} has exceeded the rate limit. Please wait and try again.` 
    }), 
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      }
    }
  );
}
