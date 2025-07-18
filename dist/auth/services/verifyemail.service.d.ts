export declare class VerifyMailerService {
    private mailer;
    constructor();
    private buildVerificationLink;
    private buildHtmlTemplate;
    send(token: string, email: string, type: string): Promise<void>;
}
export declare const VerificationMailer: VerifyMailerService;
