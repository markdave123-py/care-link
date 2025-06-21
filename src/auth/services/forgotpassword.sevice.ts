import { Mailer } from "../../core";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export class ForgotPasswordService {
    private mailer: Mailer;

    constructor() {
        this.mailer = new Mailer();
    };

    private buildPasswordResetLink(token: string): string {
        return `http://localhost:3000/api/v1/auth/patient/reset-password?token=${token}`;
    };

    private buildHtmlTemplate(link: string): string {
        return `
        <div style="font-family: Arial, sans-serif;">
            <h2>Forgot Password</h2>
            <p>Click the button below to reset your password and create a new one:</p>
            <a href="${link}" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            ">Forgot Password</a>
            <p>If you did not request this, please ignore this email.</p>
        </div>
        `;
    };

    public async send(token: string, email: string): Promise<void> {
        const link = this.buildPasswordResetLink(token);
        const html = this.buildHtmlTemplate(link);

        await this.mailer.sendMail({
            to: email,
            subject: "Forgot Password",
            html,
    });
    };
};

export const ForgotPasswordLink = new ForgotPasswordService();