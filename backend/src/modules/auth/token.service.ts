import jwt from 'jsonwebtoken';

import { AppError } from '../../errors/app-error.js';
import { UserRole } from '../users/user.model.js';

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

export function createToken(payload: AuthTokenPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

export function verifyToken(token: string, secret: string): AuthTokenPayload {
  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === 'string' ||
      typeof payload.userId !== 'string' ||
      (payload.role !== 'admin' && payload.role !== 'customer')
    ) {
      throw new AppError('Invalid authentication token.', 401);
    }

    return { userId: payload.userId, role: payload.role };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Invalid or expired authentication token.', 401);
  }
}
