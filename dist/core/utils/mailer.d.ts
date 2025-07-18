interface MailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare class Mailer {
    private transporter;
    constructor();
    sendMail({ to, subject, html }: MailOptions): Promise<void>;
}
export {};
