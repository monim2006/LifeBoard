import { Router } from 'express';
import { register, login, refreshToken, logout, profile, updateProfile } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.schema';
import { authenticate } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/register', rateLimiter, validateBody(registerSchema), register);
router.post('/login', rateLimiter, validateBody(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, profile);
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;
