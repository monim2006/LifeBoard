import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' },
  });
};

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { message: err.message },
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    error: { message: 'Internal Server Error' },
  });
};
