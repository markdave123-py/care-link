"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const core_1 = require("../../core");
class MailerService {
    constructor() {
        this.mailer = new core_1.Mailer();
    }
    wrapTemplate(title, content) {
        return `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <h2 style="color: #2b7a78;">${title}</h2>
          ${content}
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">You're receiving this email from Healthcare Scheduler. If you have any concerns, please <a href="#" style="color: #2b7a78;">contact support</a>.</p>
        </div>
      </div>
    `;
    }
    async sendSessionRequestAlert(practitionerEmail, customerName, sessionDate) {
        const subject = "📅 New Session Request Alert";
        const html = this.wrapTemplate("New Session Request", `
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Requested Date:</strong> ${sessionDate}</p>
        <p>Please log in to your dashboard to review and accept/reject this session.</p>
        <a href="#" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin-top:10px;">Go to Dashboard</a>
      `);
        await this.mailer.sendMail({ to: practitionerEmail, subject, html });
    }
    async sendWelcomeEmail(email, name) {
        const subject = "🎉 Welcome to Healthcare Scheduler!";
        const html = this.wrapTemplate(`Welcome, ${name}!`, `
        <p>We’re thrilled to have you join our network of trusted health practitioners.</p>
        <p>Start managing your sessions and reaching patients more efficiently.</p>
        <a href="#" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Visit Your Dashboard</a>
      `);
        await this.mailer.sendMail({ to: email, subject, html });
    }
    async sendPasswordResetEmail(email, resetLink) {
        const subject = "🔒 Reset Your Password";
        const html = this.wrapTemplate("Password Reset Request", `
        <p>Click the button below to securely reset your password:</p>
        <a href="${resetLink}" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Reset Password</a>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      `);
        await this.mailer.sendMail({ to: email, subject, html });
    }
    async sendPatientCancelationEmail(email, sessionDetails) {
        const subject = "❌ Session Cancelation Notification";
        const html = this.wrapTemplate("Session Cancelation", `
        <p>This is to inform you that your session request has been canceled.</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>For help or more information, please contact support.</p>
      `);
        await this.mailer.sendMail({ to: email, subject, html });
    }
    async sendPractitionerCancelationEmail(email, sessionDetails) {
        const subject = "❌ Session Cancelation Notification";
        const html = this.wrapTemplate("Session Cancelation", `
        <p>This is to inform you that a session request has been canceled.</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>For help or more information, please contact support.</p>
      `);
        await this.mailer.sendMail({ to: email, subject, html });
    }
    async sendPatientSessionRejection(email, sessionDetails) {
        const subject = "⚠️ Session Request Rejected";
        const html = this.wrapTemplate("Session Request Rejection", `
        <p>Your session request has been rejected by the health practitioner for the following reason:</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>You may explore other available practitioners from your dashboard.</p>
      `);
        await this.mailer.sendMail({ to: email, subject, html });
    }
    async sendPatientSessionAcceptance(email, sessionDetails) {
        const subject = "✅ Session Request Accepted";
        const html = this.wrapTemplate("Session Confirmed", `
        <p>Great news! Your session request has been accepted by the practitioner.</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>We look forward to your session!</p>
        <a href="#" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Details</a>
      `);
        await this.mailer.sendMail({ to: email, subject, html });
    }
    async sendPractitionerFollowUpSessionAlert(email, sessionDetails, patientName) {
        const subject = "🔔 Follow-Up Session Alert";
        const html = this.wrapTemplate("Follow-Up Session Scheduled", `
        <p>You have booked a follow-up session for patient ${patientName}.</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>Please check your dashboard for more information.</p>
      `);
        await this.mailer.sendMail({ to: email, subject, html });
    }
}
exports.MailerService = MailerService;
//# sourceMappingURL=mailer.service.js.map