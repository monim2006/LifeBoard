import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { chat } from './ai.controller';

const router = Router();

router.post('/chat', authenticate, chat);

export default router;
