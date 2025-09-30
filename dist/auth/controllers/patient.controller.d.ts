import type { NextFunction, Request, Response } from "express";
declare class PatientController {
    private static type;
    static initializeGoogleAuth: (_: Request, res: Response) => Promise<void>;
    static getPatientToken: (req: Request, res: Response) => Promise<void>;
    static login: (req: Request, res: Response, next: NextFunction) => void;
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static refreshAccessToken: (req: Request, res: Response, next: NextFunction) => void;
    static verifiedPatient: (req: Request, res: Response, next: NextFunction) => void;
    static getPatientById: (req: Request, res: Response, next: NextFunction) => void;
    static deletePatient: (req: Request, res: Response, next: NextFunction) => void;
    static forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: NextFunction) => void;
}
export default PatientController;
