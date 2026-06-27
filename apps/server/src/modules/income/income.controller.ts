import { type Request, type Response, type NextFunction } from 'express';
import * as incomeService from './income.service';

const p = (params: any, key: string) =>
  Array.isArray(params[key]) ? params[key][0] : params[key];

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const incomes = await incomeService.getIncomes(
      (req as any).userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );
    res.json({ success: true, data: incomes });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.createIncome((req as any).userId, req.body);
    res.status(201).json({ success: true, data: income });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.updateIncome(p(req.params, 'id'), (req as any).userId, req.body);
    res.json({ success: true, data: income });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await incomeService.deleteIncome(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const sources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.getIncomeSources((req as any).userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const monthlyTotal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = parseInt(p(req.params, 'month'));
    const year = parseInt(p(req.params, 'year'));
    const result = await incomeService.getMonthlyTotal((req as any).userId, month, year);
    res.json({ success: true, data: { total: result._sum.amount ?? 0 } });
  } catch (err) { next(err); }
};
