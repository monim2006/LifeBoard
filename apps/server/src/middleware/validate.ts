import { ZodError, ZodTypeAny } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../utils/errors';

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ValidationError(error.flatten().formErrors.join(', ')));
      }

      next(error);
    }
  };
};
