import { type Request, type Response, type NextFunction } from 'express';
import * as achievementService from './achievement.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const achievements = await achievementService.getAchievements(req.userId!);
    res.json({ success: true, data: achievements });
  } catch (err) { next(err); }
};

export const check = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newAchievements = await achievementService.checkAndAward(req.userId!);
    res.json({ success: true, data: newAchievements });
  } catch (err) { next(err); }
};

export const stats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await achievementService.getUserStats(req.userId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
