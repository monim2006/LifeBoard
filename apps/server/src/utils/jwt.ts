import * as jwt from 'jsonwebtoken';

const getSecret = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing JWT secret: ${name}`);
  }
  return value;
};

export const generateAccessToken = (userId: string): string => {
  const secret = getSecret(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET');
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = getSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string) => {
  const secret = getSecret(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET');
  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token: string) => {
  const secret = getSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
  return jwt.verify(token, secret);
};
