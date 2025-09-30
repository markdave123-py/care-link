import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils";

export class ErrorMiddleware {
  public static handleError(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    // Cast to AppError or generic error shape
    const statusCode = (err instanceof AppError ? err.statusCode : 500);
    const status = (err instanceof AppError ? err.status : "error");
    const message = (err instanceof AppError ? err.message : "Internal Server Error");

    // Log unexpected errors
    if (!(err instanceof AppError)) {
      console.error("Unexpected error:", err);
    }

    res.status(statusCode).json({
      status,
      message,
    });
  }
}




// import type { Request, Response, NextFunction } from "express";
// import { AppError } from "../utils";

// export class ErrorMiddleware {
//   public static handleError(
//     err: any,
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): void {
//     const statusCode = err.statusCode || 500;
//     const status = err.status || "error";
//     const message = err.message || "Internal Server Error";

//     // Log unexpected errors (not instances of AppError)
//     if (!(err instanceof AppError)) {
//       console.error("Unexpected error:", err);
//     }

//     res.status(statusCode).json({
//       status,
//       message,
//     });
//   }
// }
