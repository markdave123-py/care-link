export declare class MailerService {
    private mailer;
    constructor();
    private wrapTemplate;
    sendSessionRequestAlert(practitionerEmail: string, customerName: string, sessionDate: string): Promise<void>;
    sendWelcomeEmail(email: string, name: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
    sendPatientCancelationEmail(email: string, sessionDetails: string): Promise<void>;
    sendPractitionerCancelationEmail(email: string, sessionDetails: string): Promise<void>;
    sendPatientSessionRejection(email: string, sessionDetails: string): Promise<void>;
    sendPatientSessionAcceptance(email: string, sessionDetails: string): Promise<void>;
}
