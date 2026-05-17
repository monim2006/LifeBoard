import { Request, Response, NextFunction } from 'express';
import * as expenseService from './expense.service';

export const addExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const expense = await expenseService.addExpense(userId, req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      category: req.query.category as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = await expenseService.getExpenses(userId, filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const expenseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const expense = await expenseService.updateExpense(expenseId, userId, req.body);
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const expenseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await expenseService.deleteExpense(expenseId, userId);
    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

export const getTodayTotal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const total = await expenseService.getDailyTotal(userId, new Date().toISOString());
    res.status(200).json({ success: true, data: { total } });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyTotal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const startDate = (req.query.startDate as string) || new Date().toISOString();
    const total = await expenseService.getWeeklyTotal(userId, startDate);
    res.status(200).json({ success: true, data: { total } });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const breakdown = await expenseService.getCategoryBreakdown(userId, startDate, endDate);
    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
};
