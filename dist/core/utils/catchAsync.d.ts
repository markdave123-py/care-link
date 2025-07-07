import type { Request, Response, NextFunction } from "express";
export declare class CatchAsync {
    static wrap(controller: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): (req: Request, res: Response, next: NextFunction) => void;
}
