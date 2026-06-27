import { type Request, type Response, type NextFunction } from 'express';
import * as dailyService from './daily.service';

const p = (params: any, key: string) =>
  Array.isArray(params[key]) ? params[key][0] : params[key];

export const getToday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await dailyService.getOrCreateDailyLog((req as any).userId, new Date());
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

export const getDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = new Date(p(req.params, 'date'));
    const log = await dailyService.getOrCreateDailyLog((req as any).userId, date);
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

export const updateDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = new Date(p(req.params, 'date'));
    const log = await dailyService.updateDailyLog((req as any).userId, date, req.body);
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = new Date(req.body.date);
    const event = await dailyService.createTimelineEvent((req as any).userId, date, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await dailyService.updateTimelineEvent(p(req.params, 'eventId'), (req as any).userId, req.body);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dailyService.deleteTimelineEvent(p(req.params, 'eventId'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = new Date(req.body.date);
    const meal = await dailyService.createMeal((req as any).userId, date, req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (err) { next(err); }
};

export const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dailyService.deleteMeal(p(req.params, 'mealId'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const searchEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const query = (req.query.search as string) || '';
    const results = await dailyService.searchDailyLogs(userId, query);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
