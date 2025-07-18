import type { Response } from 'express';
interface SessionPDF {
    id: string | number;
    createdAt: Date | string;
    diagnosis?: string;
    prescription?: string;
    patient: {
        firstname: string;
        lastname: string;
        email: string;
    };
}
export declare const generatePrescriptionPDF: (session: SessionPDF, res: Response) => void;
export {};
