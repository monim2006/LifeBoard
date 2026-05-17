import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { RegisterInput, LoginInput, UpdateProfileInput } from './auth.schema';

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, username, password } = req.body;
    console.log('Register payload:', { email, username });
    const result = await authService.register(email, username, password);
    console.log('Register result:', { userId: result.user?.id });

    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());
    res
      .status(201)
      .json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());
    res
      .status(200)
      .json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new Error('Refresh token cookie not found');
    }

    const result = await authService.refreshSession(token);
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());
    res
      .status(200)
      .json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await authService.logout(token);
    }

    res.clearCookie('refreshToken', {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const user = await authService.getProfile(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request<{}, {}, UpdateProfileInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId as string;
    const user = await authService.updateProfile(userId, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
