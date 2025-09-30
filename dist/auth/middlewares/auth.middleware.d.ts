import type { Request, Response, NextFunction } from "express";
export type AuthenticateRequest = Request & {
    userId: string;
};
export interface DecodedToken {
    userId: string;
}
declare class AuthMiddleware {
    static authenticateUser: (req: Request, res: Response, next: NextFunction) => void;
    static authenticatePatient: (req: Request, res: Response, next: NextFunction) => void;
    static authenticateHp: (req: Request, res: Response, next: NextFunction) => void;
    static authenticateAdmin: (req: Request, res: Response, next: NextFunction) => void;
    static refreshTokenValidation: (req: Request, res: Response, next: NextFunction) => void;
    static verifyUserEmail: (req: Request, res: Response, next: NextFunction) => void;
}
export default AuthMiddleware;
