import { Mailer } from "../../core";

export class VerifyMailerService {
	private mailer: Mailer;

	constructor() {
		this.mailer = new Mailer();
	};

	private buildVerificationLink(token: string, type: string): string {
		return `http://localhost:3000/api/v1/auth/${type}/verify-user?token=${token}`;
	};

	private buildHtmlTemplate(link: string): string {
		return `
        <div style="font-family: Arial, sans-serif;">
            <h2>Email Verification</h2>
            <p>Click the button below to verify your email address:</p>
            <a href="${link}" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            ">Verify Email</a>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;
	};

    public async send(token:string, email: string, type: string): Promise<void> {
        const link = this.buildVerificationLink(token, type);
        const html = this.buildHtmlTemplate(link);

        await this.mailer.sendMail({
            to: email,
            subject: "Verify Your Email",
            html
        })
    }
}
export const VerificationMailer = new VerifyMailerService();