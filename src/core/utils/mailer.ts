import type { Transporter } from "nodemailer";
import * as nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export class Mailer {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendMail({ to, subject, html }: MailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Healthcare Scheduler" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      throw new Error("Email sending failed");
    }
  }
}