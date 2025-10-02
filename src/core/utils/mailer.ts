// src/core/utils/mailer.ts
import * as sgMail from '@sendgrid/mail';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export class Mailer {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendMail({ to, subject, html }: MailOptions): Promise<void> {
    try {
      await sgMail.send({
        from: `"Healthcare Scheduler" <${process.env.FROM_EMAIL || 'noreply@yourdomain.com'}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Email sending failed");
    }
  }
}
