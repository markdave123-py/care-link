import type { NextFunction, Request, Response } from "express";
declare class AuthController {
    static refreshAccessToken: (req: Request, res: Response, next: NextFunction) => void;
    static logout: (req: Request, res: Response, next: NextFunction) => void;
    static forgotPassword: (email: string, userId: string) => Promise<void>;
    static resetPassword: (req: Request, res: Response, next: NextFunction) => void;
}
export default AuthController;
