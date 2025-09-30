export declare function generateSessionPdf(session: {
    id: string;
    patient_symptoms: string;
    health_practitioner_report: string;
    diagnosis: string;
    prescription: string;
    status: string;
    start_time: Date;
    end_time: Date;
}): Promise<Buffer>;
