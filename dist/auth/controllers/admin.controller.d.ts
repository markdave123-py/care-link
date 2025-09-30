import type { NextFunction, Request, Response } from "express";
export declare class AdminController {
    private static type;
    static initializeGoogleAuth: (_: Request, res: Response) => Promise<void>;
    static getAdminToken: (req: Request, res: Response) => Promise<void>;
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static login: (req: Request, res: Response, next: NextFunction) => void;
    static requestAdmin: (req: Request, res: Response, next: NextFunction) => void;
    static refreshAccessToken: (req: Request, res: Response, next: NextFunction) => void;
    static logout: (req: Request, res: Response, next: NextFunction) => void;
    static inviteAdmin: (req: Request, res: Response, next: NextFunction) => void;
    static getAdminById: (req: Request, res: Response, next: NextFunction) => void;
    static getAllAdmins: (req: Request, res: Response, next: NextFunction) => void;
    static deleteAdmin: (req: Request, res: Response, next: NextFunction) => void;
    static forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    static getAllPatients: (req: Request, res: Response, next: NextFunction) => void;
    static getAllPractitioners: (req: Request, res: Response, next: NextFunction) => void;
    static searchPatientByEmailOrName: (req: Request, res: Response, next: NextFunction) => void;
    static searchPractitionerByEmailOrName: (req: Request, res: Response, next: NextFunction) => void;
}
