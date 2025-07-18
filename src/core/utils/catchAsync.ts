// src/utils/SendAsync.ts
import type { Request, Response, NextFunction } from "express";

export class CatchAsync {
  public static wrap(
    controller: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
      controller(req, res, next).catch(next);
    };
  }
}
