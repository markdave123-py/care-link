import type { Response, NextFunction } from "express";
export declare class HpSession {
    static declineRequest: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static acceptRequest: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static startSession: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static endSession: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static followupSession: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static updateSessionDetails: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static createFollowUpSession: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
