import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';
import { CreateCategoryInput, UpdateCategoryInput } from './category.schema';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const type = req.query.type as string | undefined;
    const categories = await categoryService.getCategories(userId, type);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const p = (params: any, key: string) => Array.isArray(params[key]) ? params[key][0] : params[key];

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const category = await categoryService.getCategory(p(req.params, 'id'), userId);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request<{}, {}, CreateCategoryInput>, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const category = await categoryService.createCategory(userId, req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request<{ id: string }, {}, UpdateCategoryInput>, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const category = await categoryService.updateCategory(p(req.params, 'id'), userId, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await categoryService.deleteCategory(p(req.params, 'id'), userId);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

export const toggleArchive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const category = await categoryService.archiveCategory(p(req.params, 'id'), userId);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const reorder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { items } = req.body as { items: { id: string; order: number }[] };
    await categoryService.reorderCategories(userId, items);
    res.json({ success: true, message: 'Categories reordered' });
  } catch (error) {
    next(error);
  }
};
