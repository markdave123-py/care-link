import type { NextFunction, Request, Response } from "express";
declare class HpController {
    private static type;
    static initializeGoogleAuth: (_: Request, res: Response) => Promise<void>;
    static getPractitionerToken: (req: Request, res: Response) => Promise<void>;
    static login: (req: Request, res: Response, next: NextFunction) => void;
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static refreshAccessToken: (req: Request, res: Response, next: NextFunction) => void;
    static verifiedHealthPractitioner: (req: Request, res: Response, next: NextFunction) => void;
    static getPractitionerById: (req: Request, res: Response, next: NextFunction) => void;
    static getAllPractitioners: (req: Request, res: Response, next: NextFunction) => void;
    static deletePractitioner: (req: Request, res: Response, next: NextFunction) => void;
    static forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    static logout: (req: Request, res: Response, next: NextFunction) => void;
}
export default HpController;
