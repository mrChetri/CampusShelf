import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization header' });
    return;
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  // 1. Support hermetic test tokens: test-token:<uuid>:<email>:<name>
  if (token.startsWith('test-token:')) {
    const parts = token.split(':');
    if (parts.length >= 4) {
      req.user = {
        id: parts[1],
        email: parts[2],
        fullName: parts.slice(3).join(':'),
        avatarUrl: null,
      };
      next();
      return;
    }
  }

  // 2. Standard JWT parsing (header.payload.signature)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);

      const userId = payload.sub || payload.id;
      const email = payload.email || payload.user_metadata?.email;
      const fullName = payload.user_metadata?.full_name || payload.name || email?.split('@')[0] || 'Campus Student';
      const avatarUrl = payload.user_metadata?.avatar_url || payload.picture || null;

      if (userId && email) {
        req.user = {
          id: userId,
          email,
          fullName,
          avatarUrl,
        };
        next();
        return;
      }
    }
  } catch {
    // Malformed JWT payload
  }

  res.status(401).json({ error: 'Invalid or expired token' });
}
