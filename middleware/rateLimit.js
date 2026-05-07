import RateLimitHit from '../models/RateLimitHit.js';

export function rateLimit({ max = 10 } = {}) {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const username = req.params.username || '';
    const windowStart = new Date(Math.floor(Date.now() / 3600000) * 3600000);
    const key = `ip:${ip}:username:${username}`;
    try {
      const hit = await RateLimitHit.findOneAndUpdate(
        { key, windowStart },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
      if (hit.count > max) {
        return res.status(429).json({ error: { message: 'Too many requests' } });
      }
      next();
    } catch {
      next();
    }
  };
}
