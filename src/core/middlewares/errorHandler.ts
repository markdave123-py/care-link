import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils";

export class ErrorMiddleware {
  public static handleError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    const message = err.message || "Internal Server Error";

    // Log unexpected errors (not instances of AppError)
    if (!(err instanceof AppError)) {
      console.error("Unexpected error:", err);
    }

    res.status(statusCode).json({
      status,
      message,
    });
  }
}
