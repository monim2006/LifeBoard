import { type Request, type Response, type NextFunction } from 'express';
import * as projectService from './project.service';

const p = (params: any, key: string) =>
  Array.isArray(params[key]) ? params[key][0] : params[key];

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.getProjects((req as any).userId);
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.getProject(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.createProject((req as any).userId, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.updateProject(p(req.params, 'id'), (req as any).userId, req.body);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.deleteProject(p(req.params, 'id'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const addTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await projectService.createTask(p(req.params, 'id'), (req as any).userId, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await projectService.updateTask(p(req.params, 'taskId'), (req as any).userId, req.body);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

export const removeTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.deleteTask(p(req.params, 'taskId'), (req as any).userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};
