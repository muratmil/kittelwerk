const store = new Map();

function getIp(req) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.headers.get('x-real-ip') || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getPathname(req) {
  try {
    return new URL(req.url).pathname;
  } catch {
    // req.url relative path ise veya parse edilemezse
    return typeof req.url === 'string' ? req.url.split('?')[0] : '/unknown';
  }
}

export function rateLimit(req, { limit = 5, windowMs = 60_000 } = {}) {
  try {
    const ip = getIp(req);
    const pathname = getPathname(req);
    const key = `${ip}:${pathname}`;
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
  } catch {
    // Hata olursa isteği geçir (fail-open)
    return { allowed: true, retryAfter: 0 };
  }
}

export function rateLimitResponse(retryAfter) {
  return Response.json(
    { error: 'Zu viele Anfragen. Bitte später erneut versuchen.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
