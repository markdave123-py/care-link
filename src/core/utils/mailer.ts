import * as nodemailer from "nodemailer";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

interface MailOptions {
	to: string,
    emailTemplate: string,
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
	port: 465,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

export class Mailer {
	static sendEmail = ({ to, emailTemplate }: MailOptions) => {
		const mailOptions = {
			from: `"Healthcare Scheduler" <${process.env.EMAIL_USER}>`,
			to,
			subject: "Verify Email",
			html: emailTemplate,
		};
		return transporter.sendMail(mailOptions);
	};
}
