import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../utils/errors';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
    theme: string;
    currency: string;
    weekStartDay: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const register = async (
  email: string,
  username: string,
  password: string
): Promise<AuthResult> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new ValidationError('A user with that email or username already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (email: string, password: string): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refreshSession = async (token: string): Promise<AuthResult> => {
  try {
    const payload = verifyRefreshToken(token) as { userId: string };
    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token is invalid or expired');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.update({
      where: { token },
      data: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw new UnauthorizedError('Refresh token is invalid or expired');
  }
};

export const logout = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const updateProfile = async (
  userId: string,
  data: Partial<{
    username: string;
    avatar: string;
    theme: string;
    currency: string;
    weekStartDay: string;
  }>
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return user;
};
