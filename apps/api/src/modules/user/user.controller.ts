import { Request, Response } from 'express';
import { userService } from './user.service';

export class UserController {
  public getMe = (req: Request, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const profile = userService.getOrCreateProfile(req.user);
    res.status(200).json(profile);
  };
}

export const userController = new UserController();
