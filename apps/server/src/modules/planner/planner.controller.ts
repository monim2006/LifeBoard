import { Request, Response, NextFunction } from 'express';
import * as plannerService from './planner.service';

export const createWeekPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const plan = await plannerService.createWeekPlan(userId, req.body.weekStartDate);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const getCurrentWeekPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const plan = await plannerService.getWeekPlan(userId);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const getWeekPlanByStart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const startDate = Array.isArray(req.params.startDate)
      ? req.params.startDate[0]
      : req.params.startDate;
    const plan = await plannerService.getWeekPlan(userId, startDate);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const addTimeBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = Array.isArray(req.params.planId) ? req.params.planId[0] : req.params.planId;
    const block = await plannerService.addTimeBlock(planId, req.body);
    res.status(201).json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

export const updateTimeBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blockId = Array.isArray(req.params.blockId) ? req.params.blockId[0] : req.params.blockId;
    const block = await plannerService.updateTimeBlock(blockId, req.body);
    res.status(200).json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

export const toggleTimeBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blockId = Array.isArray(req.params.blockId) ? req.params.blockId[0] : req.params.blockId;
    const block = await plannerService.toggleTimeBlock(blockId);
    res.status(200).json({ success: true, data: block });
  } catch (error) {
    next(error);
  }
};

export const deleteTimeBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blockId = Array.isArray(req.params.blockId) ? req.params.blockId[0] : req.params.blockId;
    await plannerService.deleteTimeBlock(blockId);
    res.status(200).json({ success: true, message: 'Time block deleted' });
  } catch (error) {
    next(error);
  }
};

export const listPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const includeTemplates = req.query.includeTemplates === 'true';
    const plans = await plannerService.listPlans(userId, includeTemplates);
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const planId = Array.isArray(req.params.planId) ? req.params.planId[0] : req.params.planId;
    await plannerService.deletePlan(planId, userId);
    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
};
