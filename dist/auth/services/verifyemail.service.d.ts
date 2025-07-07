export declare class VerifyMailerService {
    private mailer;
    constructor();
    private buildVerificationLink;
    private buildHtmlTemplate;
    send(email: string, token: string): Promise<void>;
}
export declare const VerificationMailer: VerifyMailerService;
