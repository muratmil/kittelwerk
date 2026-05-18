const store = new Map();

function getIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(req, { limit = 5, windowMs = 60_000 } = {}) {
  const ip = getIp(req);
  const url = new URL(req.url);
  const key = `${ip}:${url.pathname}`;
  const now = Date.now();

  const record = store.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count++;
  store.set(key, record);

  if (store.size > 2000) {
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  const allowed = record.count <= limit;
  const retryAfter = Math.ceil((record.resetAt - now) / 1000);
  return { allowed, retryAfter };
}

export function rateLimitResponse(retryAfter) {
  return Response.json(
    { error: 'Zu viele Anfragen. Bitte später erneut versuchen.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
