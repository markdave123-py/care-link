export declare function generateSessionPdf(session: {
    id: string;
    patient_symptoms: string;
    health_practitioner_report: string;
    diagnosis: string;
    prescription: string;
    status: string;
    time: Date;
}): Promise<Buffer>;
