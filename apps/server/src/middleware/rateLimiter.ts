import { NextFunction, Request, Response } from 'express';

const windowMs = 60_000;
const maxRequests = 100;
const memory = new Map<string, { count: number; firstRequest: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown';
  const entry = memory.get(key);
  const now = Date.now();

  if (!entry) {
    memory.set(key, { count: 1, firstRequest: now });
    return next();
  }

  if (now - entry.firstRequest > windowMs) {
    memory.set(key, { count: 1, firstRequest: now });
    return next();
  }

  if (entry.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: { message: 'Too many requests, please try again later.' },
    });
  }

  entry.count += 1;
  memory.set(key, entry);
  next();
};
