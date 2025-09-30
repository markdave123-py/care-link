"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationMailer = exports.VerifyMailerService = void 0;
const core_1 = require("../../core");
class VerifyMailerService {
    constructor() {
        this.mailer = new core_1.Mailer();
    }
    ;
    buildVerificationLink(token, type) {
        return `http://localhost:3000/api/v1/auth/${type}/verify-user?token=${token}`;
    }
    ;
    buildHtmlTemplate(link) {
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
    }
    ;
    async send(token, email, type) {
        const link = this.buildVerificationLink(token, type);
        const html = this.buildHtmlTemplate(link);
        await this.mailer.sendMail({
            to: email,
            subject: "Verify Your Email",
            html
        });
    }
}
exports.VerifyMailerService = VerifyMailerService;
exports.VerificationMailer = new VerifyMailerService();
//# sourceMappingURL=verifyemail.service.js.map