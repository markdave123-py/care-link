import type { NextFunction } from 'express';
export declare function requireFields(body: unknown, next: NextFunction, ...fields: string[]): void;
