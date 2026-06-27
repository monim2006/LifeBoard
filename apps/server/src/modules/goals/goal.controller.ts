import { type Request, type Response, type NextFunction } from 'express';
import * as goalService from './goal.service';

const p = (params: any, key: string) =>
  Array.isArray(params[key]) ? params[key][0] : params[key];

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await goalService.getGoals((req as any).userId);
    res.json({ success: true, data: goals });
  } catch (err) { next(err); }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.getGoal(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true, data: goal });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.createGoal((req as any).userId, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.updateGoal(p(req.params, 'id'), (req as any).userId, req.body);
    res.json({ success: true, data: goal });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await goalService.deleteGoal(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const addMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestone = await goalService.createMilestone(p(req.params, 'id'), (req as any).userId, req.body);
    res.status(201).json({ success: true, data: milestone });
  } catch (err) { next(err); }
};

export const toggleMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestone = await goalService.toggleMilestone(p(req.params, 'milestoneId'), (req as any).userId);
    res.json({ success: true, data: milestone });
  } catch (err) { next(err); }
};

export const removeMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await goalService.deleteMilestone(p(req.params, 'milestoneId'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};
