// Simple in-memory rate limiter for serverless (per-instance)
const buckets = new Map();

export function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  if (!buckets.has(key)) {
    buckets.set(key, { count: 1, start: now });
    return true;
  }
  const bucket = buckets.get(key);
  if (now - bucket.start > windowMs) {
    bucket.count = 1;
    bucket.start = now;
    return true;
  }
  bucket.count++;
  if (bucket.count > maxRequests) return false;
  return true;
}
