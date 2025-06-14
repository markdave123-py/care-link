import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { buildUrl } from "../utils/google";
import { google } from "../config/oauth";
import Send from "../utils/response.utils";
import type { AuthenticateRequest } from "../middlewares/auth.middleware";
import { AppError, Patient } from "../../core";
import { config } from "dotenv";
import { CatchAsync } from "../../core";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

class PatientController {
	static login = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email, password } = req.body;

			if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			const patient = await Patient.findOne({
				where: { email },
			});
			if (!patient) {
				return next(new AppError("Invalid credential", 404));
			}

			const isPasswordValid = await bcrypt.compare(password, patient.password);
			if (!isPasswordValid) {
				return next(new AppError("Incorrect password", 401));
			}

			const accessToken = jwt.sign(
				{ userId: patient.id },
				process.env.JWT_SECRET,
				{
					expiresIn: "15m",
				}
			);

			const refreshToken = jwt.sign(
				{ userId: patient.id },
				process.env.JWT_REFRESH_TOKEN_SECRET,
				{ expiresIn: "1d" }
			);

			await patient.update({
				refresh_token: refreshToken,
			});

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 15 * 60 * 1000,
				sameSite: "strict",
			});
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 24 * 60 * 60 * 1000,
				sameSite: "strict",
			});

			return Send.success(res, {
				id: patient.id,
				firstname: patient.firstname,
				email: patient.email,
				createdAt: patient.createdAt,
				UpdatedAt: patient.updatedAt,
			});
		}
	);

	static register = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { firstname, lastname, email, password } = req.body;

			const existingPatient = await Patient.findOne({
				where: { email },
			});

			if (existingPatient) {
				return next(new AppError("Email already in use", 400));
			}

			const hashedpassword = await bcrypt.hash(password, 10);

			const newUser = await Patient.create({
				email,
				firstname,
				lastname,
				password: hashedpassword,
				email_verified: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			return Send.success(
				res,
				{
					id: newUser.id,
					firstname: newUser.firstname,
					lastname: newUser.lastname,
					email: newUser.email,
					refreshToken: newUser.refresh_token,
					createdAt: newUser.createdAt,
					updatedAt: newUser.updatedAt,
				},
				"User created successfully"
			);
		}
	);

	static logout = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response) => {
			const patientId = req.userId;
			if (patientId) {
				await Patient.update(
					{ refresh_token: null },
					{ where: { id: patientId } }
				);
			}

			res.clearCookie("accessToken");
			res.clearCookie("refreshToken");

			return Send.success(res, null, "Logged out successfully");
		}
	);

	static refreshToken = async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
		if (!process.env.JWT_EXPIRES_IN) {
			return next(new AppError("Missing environment variable", 500));
		}
		try {
			const userId = req.userId;
			const refreshToken = req.cookies.refreshToken;

			const user = await Patient.findOne({
				where: { id: userId },
			});

			if (!user || !refreshToken) {
				return Send.unauthorized(res, "Refresh Token not found");
			}

			if (user.refresh_token !== refreshToken) {
				return Send.unauthorized(res, { message: "Invalid Refresh Token" });
			}

			const newAccessToken = jwt.sign(
				{ userId: user.id },
				process.env.JWT_EXPIRES_IN,
				{ expiresIn: 15 * 60 * 1000 }
			);

			res.cookie("accessToken", newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 15 * 60 * 1000,
				sameSite: "strict",
			});

			return Send.success(res, {
				message: "Access Token refreshed successfully",
			});
		} catch (err) {
			console.error("Error refreshing token: ", err);
			return Send.error(res, null, "Error generating accessToken");
		}
	};
}

export const initializeGoogleAuth = async (_: Request, res: Response) => {
	const consent_screen = buildUrl(google);
	res.redirect(consent_screen);
};

export const getToken = async (req: Request, res: Response): Promise<void> => {
	console.log(req.query);

	const { code } = req.query;

	const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

	if (
		!process.env.GOOGLE_CLIENT_ID ||
		!process.env.GOOGLE_CLIENT_SECRET ||
		!process.env.GOOGLE_REDIRECT_URI ||
		!code
	) {
		res.status(400).json({ error: "Missing required OAuth parameters" });
		return;
	}

	try {
		const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: process.env.GOOGLE_CLIENT_ID,
				client_secret: process.env.GOOGLE_CLIENT_SECRET,
				code: code as string,
				grant_type: "authorization_code",
				redirect_uri: process.env.GOOGLE_REDIRECT_URI,
			}),
		});

		if (!response.ok) {
			// Get error details from the response
			const errorText = await response.text();
			console.error("Token exchange failed:", errorText);
			res.status(400).json({
				error: "Token exchange failed",
				details: errorText,
			});
			return;
		}

		const access_token_data = await response.json();
		console.log(access_token_data);

		const { id_token } = access_token_data;

		const token_info_response = await fetch(
			`${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
		);

		res.json({
			success: true,
			data: await token_info_response.json(),
		});
	} catch (err) {
		console.error("OAuth callback error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
};

export default PatientController;
