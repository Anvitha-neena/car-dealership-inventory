import { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'Request validation failed.',
      details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
    return;
  }

  if (error instanceof MongooseError.CastError) {
    response.status(400).json({ error: 'Invalid resource identifier.' });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    response.status(409).json({ error: 'A record with this value already exists.' });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'An unexpected error occurred.' });
};
