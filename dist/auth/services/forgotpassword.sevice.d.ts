export declare class ForgotPasswordService {
    private mailer;
    constructor();
    private buildPasswordResetLink;
    private buildHtmlTemplate;
    send(token: string, email: string, type: string): Promise<void>;
}
export declare const ForgotPasswordLink: ForgotPasswordService;
