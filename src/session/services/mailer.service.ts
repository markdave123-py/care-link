import { Mailer } from "../../core";
export class MailerService {
  private mailer: Mailer;

  constructor() {
    this.mailer = new Mailer();
  }

  private wrapTemplate(title: string, content: string): string {
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

  public async sendSessionRequestAlert(practitionerEmail: string, customerName: string, sessionDate: string): Promise<void> {
    const subject = "📅 New Session Request Alert";
    const html = this.wrapTemplate(
      "New Session Request",
      `
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Requested Date:</strong> ${sessionDate}</p>
        <p>Please log in to your dashboard to review and accept/reject this session.</p>
        <a href="#" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin-top:10px;">Go to Dashboard</a>
      `
    );
    await this.mailer.sendMail({ to: practitionerEmail, subject, html });
  }

  public async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = "🎉 Welcome to Healthcare Scheduler!";
    const html = this.wrapTemplate(
      `Welcome, ${name}!`,
      `
        <p>We’re thrilled to have you join our network of trusted health practitioners.</p>
        <p>Start managing your sessions and reaching patients more efficiently.</p>
        <a href="#" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Visit Your Dashboard</a>
      `
    );
    await this.mailer.sendMail({ to: email, subject, html });
  }

  public async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = "🔒 Reset Your Password";
    const html = this.wrapTemplate(
      "Password Reset Request",
      `
        <p>Click the button below to securely reset your password:</p>
        <a href="${resetLink}" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Reset Password</a>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      `
    );
    await this.mailer.sendMail({ to: email, subject, html });
  }

  public async sendPatientCancelationEmail(email: string, sessionDetails: string): Promise<void> {
    const subject = "❌ Session Cancelation Notification";
    const html = this.wrapTemplate(
      "Session Cancelation",
      `
        <p>This is to inform you that your session request has been canceled.</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>For help or more information, please contact support.</p>
      `
    );
    await this.mailer.sendMail({ to: email, subject, html });
  }

  public async sendPractitionerCancelationEmail(email: string, sessionDetails: string): Promise<void> {
    const subject = "❌ Session Cancelation Notification";
    const html = this.wrapTemplate(
      "Session Cancelation",
      `
        <p>This is to inform you that a session request has been canceled.</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>For help or more information, please contact support.</p>
      `
    );
    await this.mailer.sendMail({ to: email, subject, html });
  }

  public async sendPatientSessionRejection(email: string, sessionDetails: string): Promise<void> {
    const subject = "⚠️ Session Request Rejected";
    const html = this.wrapTemplate(
      "Session Request Rejection",
      `
        <p>Your session request has been rejected by the health practitioner for the following reason:</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>You may explore other available practitioners from your dashboard.</p>
      `
    );
    await this.mailer.sendMail({ to: email, subject, html });
  }

  public async sendPatientSessionAcceptance(email: string, sessionDetails: string): Promise<void> {
    const subject = "✅ Session Request Accepted";
    const html = this.wrapTemplate(
      "Session Confirmed",
      `
        <p>Great news! Your session request has been accepted by the practitioner.</p>
        <p><strong>Details:</strong> ${sessionDetails}</p>
        <p>We look forward to your session!</p>
        <a href="#" style="display:inline-block; background-color:#2b7a78; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Details</a>
      `
    );
    await this.mailer.sendMail({ to: email, subject, html });
  }
}



// import { Mailer } from "../../core";

// export class MailerService {
//   private mailer: Mailer;

//   constructor() {
//     this.mailer = new Mailer();
//   }

//   public async sendSessionRequestAlert(practitionerEmail: string, customerName: string, sessionDate: string): Promise<void> {
//     const subject = "New Session Request Alert";
//     const html = `
//       <h2>New Session Request</h2>
//       <p><strong>Customer:</strong> ${customerName}</p>
//       <p><strong>Requested Date:</strong> ${sessionDate}</p>
//       <p>Please log in to your dashboard for more details.</p>
//     `;
//     await this.mailer.sendMail({ to: practitionerEmail, subject, html });
//   }

//   public async sendWelcomeEmail(email: string, name: string): Promise<void> {
//     const subject = "Welcome to Healthcare Scheduler";
//     const html = `
//       <h2>Welcome, ${name}!</h2>
//       <p>We are thrilled to have you join our network of health practitioners.</p>
//       <p>Start managing your sessions and helping patients today!</p>
//     `;
//     await this.mailer.sendMail({ to: email, subject, html });
//   }

//   public async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
//     const subject = "Reset Your Password";
//     const html = `
//       <h2>Password Reset Request</h2>
//       <p>Click the link below to reset your password:</p>
//       <a href="${resetLink}">${resetLink}</a>
//       <p>If you did not request this, you can safely ignore this email.</p>
//     `;
//     await this.mailer.sendMail({ to: email, subject, html });
//   }

//   public async sendPatientCancelationEmail(email: string, sessionDetails: string): Promise<void> {
//     const subject = "Session Cancelation Notification";
//     const html = `
//       <h2>Session Cancelation</h2>
//       <p>This is to inform you that your session request has been canceled.</p>
//       <p><strong>Details:</strong> ${sessionDetails}</p>
//       <p>If you have any questions, please contact support.</p>
//     `;
//     await this.mailer.sendMail({ to: email, subject, html });
//   }


//   public async sendPractitionerCancelationEmail(email: string, sessionDetails: string): Promise<void> {
//     const subject = "Session Cancelation Notification";
//     const html = `
//       <h2>Session Cancelation</h2>
//       <p>This is to inform you that a session request has been canceled.</p>
//       <p><strong>Details:</strong> ${sessionDetails}</p>
//       <p>If you have any questions, please contact support.</p>
//     `;
//     await this.mailer.sendMail({ to: email, subject, html });
//   }

//   public async sendPatientSessionRejection(email: string, sessionDetails: string): Promise<void> {
//     const subject = "Session Request rejection Notification";
//     const html = `
//       <h2>Session Request Rejection</h2>
//       <p>This is to inform you that a session request has been rejected by the health practitioner for the below reason.</p>
//       <p><strong>Details:</strong> ${sessionDetails}</p>
//       <p>If you have any questions, please contact support.</p>
//     `;
//     await this.mailer.sendMail({ to: email, subject, html });
//   }

//    public async sendPatientSessionAcceptance(email: string, sessionDetails: string): Promise<void> {
//     const subject = "Session Request rejection Notification";
//     const html = `
//       <h2>Session Request Rejection</h2>
//       <p>This is to inform you that a session request has been rejected by the health practitioner for the below reason.</p>
//       <p><strong>Details:</strong> ${sessionDetails}</p>
//       <p>If you have any questions, please contact support.</p>
//     `;
//     await this.mailer.sendMail({ to: email, subject, html });
//   }

// }