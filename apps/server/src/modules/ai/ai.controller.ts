import { Request, Response, NextFunction } from 'express';
import * as aiService from './ai.service';

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: { message: 'Message is required' } });
    }

    const response = await aiService.getAIResponse(userId, message, history || []);
    res.json({ success: true, data: { response } });
  } catch (error) {
    next(error);
  }
};
