import { RequestHandler } from 'express';
import { ZodType } from 'zod';

export function validateBody(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    request.body = schema.parse(request.body);
    next();
  };
}

export function validateQuery(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    Object.assign(request.query, schema.parse(request.query));
    next();
  };
}

export function validateParams(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    request.params = schema.parse(request.params);
    next();
  };
}
