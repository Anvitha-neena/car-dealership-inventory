import { RequestHandler } from 'express';

import { readEnvironment } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { AuthTokenPayload, verifyToken } from '../modules/auth/token.service.js';
import { UserRole } from '../modules/users/user.model.js';

export type AuthenticatedRequest = Express.Request & { user?: AuthTokenPayload };

export const authenticate: RequestHandler = (request, _response, next) => {
  const header = request.header('authorization');

  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication is required.', 401));
    return;
  }

  try {
    (request as AuthenticatedRequest).user = verifyToken(
      header.slice('Bearer '.length),
      readEnvironment(process.env).jwtSecret
    );
    next();
  } catch (error) {
    next(error);
  }
};

export function requireRole(role: UserRole): RequestHandler {
  return (request, _response, next) => {
    if ((request as AuthenticatedRequest).user?.role !== role) {
      next(new AppError('Administrator access is required.', 403));
      return;
    }

    next();
  };
}
