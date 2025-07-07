"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordLink = exports.ForgotPasswordService = void 0;
const core_1 = require("../../core");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
class ForgotPasswordService {
    constructor() {
        this.mailer = new core_1.Mailer();
    }
    ;
    buildPasswordResetLink(token) {
        return `http://localhost:3000/api/v1/auth/patient/reset-password?token=${token}`;
    }
    ;
    buildHtmlTemplate(link) {
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
    }
    ;
    async send(token, email) {
        const link = this.buildPasswordResetLink(token);
        const html = this.buildHtmlTemplate(link);
        await this.mailer.sendMail({
            to: email,
            subject: "Forgot Password",
            html,
        });
    }
    ;
}
exports.ForgotPasswordService = ForgotPasswordService;
;
exports.ForgotPasswordLink = new ForgotPasswordService();
//# sourceMappingURL=forgotpassword.sevice.js.map