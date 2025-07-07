import type { NextFunction, Request, Response } from "express";
export declare class AdminController {
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static login: (req: Request, res: Response, next: NextFunction) => void;
    static requestAdmin: (req: Request, res: Response, next: NextFunction) => void;
    static refreshAccessToken: (req: Request, res: Response, next: NextFunction) => void;
    static logout: (req: Request, res: Response, next: NextFunction) => void;
    static inviteAdmin: (req: Request, res: Response, next: NextFunction) => void;
}
