import { Mailer } from "../../core";

export class MailerService {
  private mailer: Mailer;

  constructor() {
    this.mailer = new Mailer();
  }

  public async sendSessionRequestAlert(practitionerEmail: string, customerName: string, sessionDate: string): Promise<void> {
    const subject = "New Session Request Alert";
    const html = `
      <h2>New Session Request</h2>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Requested Date:</strong> ${sessionDate}</p>
      <p>Please log in to your dashboard for more details.</p>
    `;
    await this.mailer.sendMail({ to: practitionerEmail, subject, html });
  }

  public async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = "Welcome to Healthcare Scheduler";
    const html = `
      <h2>Welcome, ${name}!</h2>
      <p>We are thrilled to have you join our network of health practitioners.</p>
      <p>Start managing your sessions and helping patients today!</p>
    `;
    await this.mailer.sendMail({ to: email, subject, html });
  }

  public async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = "Reset Your Password";
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;
    await this.mailer.sendMail({ to: email, subject, html });
  }

  public async sendPatientCancelationEmail(email: string, sessionDetails: string): Promise<void> {
    const subject = "Session Cancelation Notification";
    const html = `
      <h2>Session Cancelation</h2>
      <p>This is to inform you that your session request has been canceled.</p>
      <p><strong>Details:</strong> ${sessionDetails}</p>
      <p>If you have any questions, please contact support.</p>
    `;
    await this.mailer.sendMail({ to: email, subject, html });
  }


  public async sendPractitionerCancelationEmail(email: string, sessionDetails: string): Promise<void> {
    const subject = "Session Cancelation Notification";
    const html = `
      <h2>Session Cancelation</h2>
      <p>This is to inform you that a session request has been canceled.</p>
      <p><strong>Details:</strong> ${sessionDetails}</p>
      <p>If you have any questions, please contact support.</p>
    `;
    await this.mailer.sendMail({ to: email, subject, html });
  }

}