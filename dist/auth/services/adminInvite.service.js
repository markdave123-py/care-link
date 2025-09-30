"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInviteLink = exports.AdminInviteService = void 0;
const core_1 = require("../../core");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
class AdminInviteService {
    constructor() {
        this.mailer = new core_1.Mailer();
    }
    ;
    buildAdminInviteLink(token) {
        return `http://localhost:3000/api/v1/auth/admin/invite-admin?token=${token}`;
    }
    ;
    buildHtmlTemplate(link) {
        return `
        <div style="font-family: Arial, sans-serif;">
            <h2>Invite Admin</h2>
            <p>Click the button below to be an Admin:</p>
            <a href="${link}" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            ">Invite Admin</a>
            <p>If you did not request this, please ignore this email.</p>
        </div>
        `;
    }
    ;
    async send(token, email) {
        const link = this.buildAdminInviteLink(token);
        const html = this.buildHtmlTemplate(link);
        await this.mailer.sendMail({
            to: email,
            subject: "Admin Invite",
            html,
        });
    }
    ;
}
exports.AdminInviteService = AdminInviteService;
;
exports.AdminInviteLink = new AdminInviteService();
//# sourceMappingURL=adminInvite.service.js.map