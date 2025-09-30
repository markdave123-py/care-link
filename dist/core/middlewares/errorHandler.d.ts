import type { Request, Response, NextFunction } from "express";
export declare class ErrorMiddleware {
    static handleError(err: unknown, req: Request, res: Response, _next: NextFunction): void;
}
