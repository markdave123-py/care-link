import type { NextFunction } from 'express';
import { HttpStatus, AppError } from 'src/core';


export function requireFields(
  body: unknown,
  next: NextFunction,
  ...fields: string[]
): void {
  if (body === undefined || body === null || typeof body !== 'object') {
    return next(new AppError('Request body is missing', HttpStatus.BAD_REQUEST));
  }

  const obj = body as Record<string, unknown>;

  // Detect undefined fields
  const missing = fields.filter(f => obj[f] === undefined);

  if (missing.length) {
    return next(
      new AppError(
        `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      ),
    );
  }
}