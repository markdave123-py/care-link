import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import Send from "../utils/response.utils";
import { AccessToken, AppError, EmailVerificationToken, Patient, RefreshToken } from "../../core";
import { config } from "dotenv";
import { CatchAsync } from "../../core";
import { VerificationMailer } from "../services";
import AuthController from "./auth.controller";
import type { AuthenticateRequest } from "../middlewares";
import { buildUrl } from "../utils";
import { googlePatient } from "../config";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

class PatientController {
	static initializeGoogleAuth = async (_: Request, res: Response) => {
		const consent_screen = buildUrl(googlePatient);
		res.redirect(consent_screen);
	};
	
	static getPatientToken = async (req: Request, res: Response): Promise<void> => {
		console.log(req.query);

		const { code } = req.query;

		if (
			!process.env.GOOGLE_CLIENT_ID ||
			!process.env.GOOGLE_CLIENT_SECRET ||
			!process.env.GOOGLE_PATIENT_REDIRECT_URI ||
            !process.env.GOOGLE_TOKEN_ENDPOINT ||
			!code
		) {
			res.status(400).json({ error: "Missing required OAuth parameters" });
			return;
		}

		try {
			const response = await fetch(process.env.GOOGLE_TOKEN_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: process.env.GOOGLE_CLIENT_ID,
					client_secret: process.env.GOOGLE_CLIENT_SECRET,
					code: code as string,
					grant_type: "authorization_code",
					redirect_uri: process.env.GOOGLE_PATIENT_REDIRECT_URI,
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

            const { email, given_name, family_name, email_verified } = await token_info_response.json();
            const [ newUser, created ] = await Patient.findOrCreate({
				where: { email },
                defaults: { email,
                firstname: given_name,
                lastname: family_name,
                password: "null",
                email_verified,
                createdAt: new Date(),
                updatedAt: new Date(),
				}
            })

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
				created ? "User created successfully" : "User already exists"
			);
		} catch (err) {
			console.error("OAuth callback error:", err);
			res.status(500).json({ error: "Internal server error" });
		}
	};
	
	static login = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email, password } = req.body;

			if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			const patient = await Patient.findOne({
				where: { email },
			});
			if (!patient?.password) {
				return next(new AppError("Invalid credential", 404));
			}

			const isPasswordValid = await bcrypt.compare(password, patient.password);
			if (!isPasswordValid) {
				return next(new AppError("Incorrect password", 401));
			}

			const accessToken = AccessToken.sign(patient.id);

			const refreshToken = RefreshToken.sign(patient.id);

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

			const token = EmailVerificationToken.sign(newUser.id);
			await VerificationMailer.send(email, token);

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

	static refreshAccessToken = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response) => {
			if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
				throw new Error("Missing Environment variable");
			}

			const userId = req.userId;
			const refreshToken = req.cookies.refreshToken;

			const user = await Patient.findOne({
				where: { id: userId },
			});

			if (!user || !refreshToken) {
				return Send.unauthorized(res, null, "Request Token not found");
			}
			if (user.refresh_token !== refreshToken) {
				return Send.unauthorized(res, null, "Invalid refresh token");
			}

			const accessToken = AccessToken.sign(userId);

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 15 * 60 * 1000,
				sameSite: "strict",
			});

			return Send.success(res, null, "Access Token refreshed successfully");
		}
	);

	static verifiedPatient = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const verifiedUserId = req.userId;

			const user = await Patient.update(
				{ email_verified: true },
				{
					where: { id: verifiedUserId },
				},
			);
			if (!user) {
				return next(new AppError(`User of ID: ${verifiedUserId} not found`, 404));
			}

			res.status(200).json({
				message: "User verified successfully",
			})
		}
	);

	static getPatientById = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const userId = req.params.id;

			const patient = await Patient.findOne({
				where: { id: userId },
				attributes: { exclude: ["password"] },
			});
			if (!patient) {
				return next(
					new AppError(`Patient with Id: ${userId} not found`, 404)
				);
			}

			return Send.success(res, { patient });
		}
	);

	static getAllPatients = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const allPatients = await Patient.findAll();
			if (!allPatients) {
				return next(new AppError("No Patient seen", 404));
			}

			return Send.success(res, { allPatients });
		}
	);

	static deletePatient = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const patientId = req.params.id;

			const patient = await Patient.findOne({
				where: { id: patientId },
			});

			if (!patient) {
				return next(
					new AppError(`Patient with ID ${patientId} not found`, 404)
				);
			}

			await patient.destroy();

			return Send.success(res, null, "Patient deleted successfully");
		}
	);

	static forgotPassword = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
		const { email } = req.body;

		const passwordForgetter = await Patient.findOne({
			where: { email }
		});
		if (!passwordForgetter) {
			return next(new AppError(`User with Email: ${email} not found`, 404))
		}
		
		await AuthController.forgotPassword(email, passwordForgetter.id)

		return Send.success(res, null, "Link to reset password sent successfully")
	});

	static resetPassword = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
		const { token } = req.query;
		const { password } = req.body;

		if (!token || typeof(token) !== "string") {
			return next(new AppError("Invalid or missing token", 401))
		};

		if (!password || password.length < 6) {
			return next(new AppError("Password must be atleast 6 characters long", 401))
		};

		const decoded = AccessToken.verify(token);
		const hashedPassword = await bcrypt.hash(password, 10);
		
		const resetUserPassword = await Patient.update(
			{ password: hashedPassword },
			{ where: { id: decoded.userId } }
		);

		return Send.success(res, {...resetUserPassword}, "Password Reset successful")
	});
}

export default PatientController;
