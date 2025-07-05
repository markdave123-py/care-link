import { Mailer } from "../../core";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export class AdminInviteService {
    private mailer: Mailer;

    constructor() {
        this.mailer = new Mailer();
    };

    private buildAdminInviteLink(token: string): string {
        return `http://localhost:3000/api/v1/auth/admin/invite-admin?token=${token}`;
    };

    private buildHtmlTemplate(link: string): string {
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
    };

    public async send(email: string, token: string): Promise<void> {
        const link = this.buildAdminInviteLink(token);
        const html = this.buildHtmlTemplate(link);

        await this.mailer.sendMail({
            to: email,
            subject: "Admin Invite",
            html,
    });
    };
};

export const AdminInviteLink = new AdminInviteService();