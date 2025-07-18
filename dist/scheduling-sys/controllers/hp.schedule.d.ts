import type { Response, NextFunction } from "express";
export declare class HpSchedule {
    static getSchedule: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static upsertSchedule: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
