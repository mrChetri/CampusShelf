import type { Request, Response, NextFunction } from 'express';
import { userService } from '../modules/user/user.service';

export function requireAdminOrModeratorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  const profile = userService.getProfileById(user.id);
  if (!profile || (profile.role !== 'MODERATOR' && profile.role !== 'ADMIN')) {
    res.status(403).json({ error: 'Forbidden: administrator or moderator privileges required' });
    return;
  }

  next();
}
