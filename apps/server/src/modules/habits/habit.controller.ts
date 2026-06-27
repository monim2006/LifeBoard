import { type Request, type Response, type NextFunction } from 'express';
import * as habitService from './habit.service';

const p = (params: any, key: string) =>
  Array.isArray(params[key]) ? params[key][0] : params[key];

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habits = await habitService.getHabits((req as any).userId);
    res.json({ success: true, data: habits });
  } catch (err) { next(err); }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.getHabit(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true, data: habit });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.createHabit((req as any).userId, req.body);
    res.status(201).json({ success: true, data: habit });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.updateHabit(p(req.params, 'id'), (req as any).userId, req.body);
    res.json({ success: true, data: habit });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await habitService.deleteHabit(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const log = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await habitService.logHabit((req as any).userId, req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err) { next(err); }
};

export const streak = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await habitService.getHabitStreak(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
