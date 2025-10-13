// src/core/utils/mailer.ts
import * as sgMail from '@sendgrid/mail';
// import { env } from 'src/auth';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export class Mailer {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY environment variable is not set");
    }

    if (!fromEmail) {
      throw new Error("FROM_EMAIL environment variable is not set");
    }

    console.log(`[mailer] Initializing SendGrid with API key: ${apiKey.substring(0, 10)}...`);
    console.log(`[mailer] Using FROM email: ${fromEmail}`);

    sgMail.setApiKey(apiKey);
  }

  async sendMail({ to, subject, html }: MailOptions): Promise<void> {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

      console.log(`[mailer] Sending email from ${fromEmail} to ${to}`);
      console.log(`[mailer] Subject: ${subject}`);

      await sgMail.send({
        from: `"Healthcare Scheduler" <${fromEmail}>`,
        to,
        subject,
        html,
      });

      console.log(`[mailer] Email sent successfully to ${to}`);
    } catch (error: any) {
      console.error("[mailer] Failed to send email:", error.message);
      console.error("[mailer] Error code:", error.code);
      console.error("[mailer] Error response:", error.response?.body);

      // Provide specific debugging information
      if (error.code === 403) {
        console.error("[mailer] DEBUG: 403 Forbidden error. Possible causes:");
        console.error("[mailer] 1. SendGrid API key is invalid or expired");
        console.error("[mailer] 2. API key doesn't have mail sending permissions");
        console.error("[mailer] 3. FROM_EMAIL address is not verified in SendGrid");
        console.error("[mailer] 4. SendGrid account may be suspended");
        console.error("[mailer] SOLUTION: Check your SendGrid account and verify the FROM_EMAIL address");
      }

      throw new Error("Email sending failed");
    }
  }
}
