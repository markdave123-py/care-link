import type { Response, NextFunction } from "express";
export declare class PatientSession {
    static requestSession: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static cancelRequest: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getPatientSessions: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static rateSession: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static downloadPrescription: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
