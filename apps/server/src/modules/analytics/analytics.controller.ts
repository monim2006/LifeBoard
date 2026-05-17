import { Request, Response, NextFunction } from 'express';
import { getUserAnalytics } from './analytics.service';

export const analyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const summary = await getUserAnalytics(userId);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
