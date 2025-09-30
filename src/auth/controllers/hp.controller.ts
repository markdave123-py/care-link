import type { NextFunction, Request, Response } from "express";
import {
	AccessToken,
	AppError,
	HealthPractitioner,
	RefreshToken,
	CatchAsync,
	EmailVerificationToken,
	HPType,
} from "../../core";
import Send from "../utils/response.utils";
import { config } from "dotenv";
import * as bcrypt from "bcrypt";
import AuthController from "./auth.controller";
import type { AuthenticateRequest } from "../middlewares";
import { buildUrl } from "../utils";
import { googleHp } from "../config";
import { requireFields } from "../../common/validation";
import { processFiles } from "../../common/upload";
import { HpMapper } from "../mappers/hp.mapper";
import { PublishToQueue } from "../../common/rabbitmq/producer";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

class HpController {
	private static type: string = "hp";
	static initializeGoogleAuth = async (_: Request, res: Response) => {
		const consent_screen = buildUrl(googleHp);
		res.redirect(consent_screen);
	};

	static getPractitionerToken = async (
		req: Request,
		res: Response
	): Promise<void> => {
		console.log(req.query);

		const { code } = req.query;

		if (
			!process.env.GOOGLE_CLIENT_ID ||
			!process.env.GOOGLE_CLIENT_SECRET ||
			!process.env.GOOGLE_HP_REDIRECT_URI ||
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
					redirect_uri: process.env.GOOGLE_HP_REDIRECT_URI,
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

			const { email, given_name, family_name, email_verified } =
				await token_info_response.json();
			const [newUser, created] = await HealthPractitioner.findOrCreate({
				where: { email },
				defaults: {
					email,
					firstname: given_name,
					lastname: family_name,
					hp_type_id: "c632348a-db2e-430f-a582-004c9fd773b0",
					refresh_token: "",
					password: null,
					email_verified,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});

			const accessToken = AccessToken.sign(newUser.id);
			const refreshToken = RefreshToken.sign(newUser.id);

			newUser.refresh_token = refreshToken;
			await newUser.save();

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 15 * 60 * 1000, // 15 minutes
			});

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			return Send.success(
				res,
				created ? "User created successfully" : "User already exists",
				HpMapper.hpResponse(newUser)
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

			const hp = await HealthPractitioner.findOne({
				where: { email },
			});
			if (!hp?.password) {
				return next(new AppError("Invalid credentials", 401));
			}

			const isPasswordValid = await bcrypt.compare(password, hp.password);
			if (!isPasswordValid) {
				return next(new AppError("Incorrect password", 401));
			}

			const accessToken = AccessToken.sign(hp.id);

			const refreshToken = RefreshToken.sign(hp.id);

			await hp.update({
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

			return Send.success(
				res,
				"User Logged in successfully",
				HpMapper.hpResponse(hp)
			);
		}
	);

	static register = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			requireFields(
				req.body,
				next,
				"firstname",
				"lastname",
				"hp_type_id",
				"email",
				"password",
			);

			const { firstname, lastname, hp_type_id, email, password } = req.body;

			const existingHp = await HealthPractitioner.findOne({
				where: { email },
			});

			if (existingHp) {
				return next(new AppError("Email already in use", 400));
			}

			const hptype = await HPType.findOne({
				where: {id: hp_type_id}
			})

			if (!hptype) return next(new AppError("Invalid health practitioner type", 404))

			const docUrls = await processFiles(req.files, {
				profile_picture: "profile_picture",
				passport: "passport",
				idcard: "idcard",
			});

			const hashedpassword = await bcrypt.hash(password, 10);

			const newUser = await HealthPractitioner.create({
				email,
				firstname,
				lastname,
				hp_type_id,
				password: hashedpassword,
				passport: docUrls.passport,
				profile_picture: docUrls.profile_picture,
				idcard: docUrls.idcard,
				refresh_token: "",
				email_verified: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const accessToken = AccessToken.sign(newUser.id);
			const refreshToken = RefreshToken.sign(newUser.id);

			newUser.refresh_token = refreshToken;
			await newUser.save();

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 15 * 60 * 1000, // 15 minutes
			});

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			const type = "hp";
			const token = EmailVerificationToken.sign(newUser.id);
			const data = { email, token, type };
			const key = "auth.hp.register"; // routing_key for rabbitmq
			await PublishToQueue.email(key, data);

			return Send.success(res, "User created successfully", {
				id: newUser.id,
				firstname: newUser.firstname,
				lastname: newUser.lastname,
				email: newUser.email,
				hp_type_id: newUser.hp_type_id,
				refreshToken: newUser.refresh_token,
				passport: newUser.passport,
				profile_picture: newUser.profile_picture,
				idcard: newUser.idcard,
				createdAt: newUser.createdAt,
				updatedAt: newUser.updatedAt,
			});
		}
	);

	static refreshAccessToken = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response) => {
			if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
				throw new Error("Missing Environment variable");
			}

			const userId = req.userId;
			const refreshToken = req.cookies.refreshToken;

			const user = await HealthPractitioner.findOne({
				where: { id: userId },
			});

			if (!user || !refreshToken) {
				return Send.unauthorized(res, "Request Token not found");
			}
			if (user.refresh_token !== refreshToken) {
				return Send.unauthorized(res, "Invalid refresh token");
			}

			const accessToken = AccessToken.sign(userId);

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 15 * 60 * 1000,
				sameSite: "strict",
			});

			return Send.success(res, "Access Token refreshed successfully");
		}
	);

	static verifiedHealthPractitioner = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const verifiedUserId = req.userId;

			const user = await HealthPractitioner.update(
				{ email_verified: true },
				{ where: { id: verifiedUserId } }
			);
			if (!user) {
				return next(
					new AppError(`Practitioner of ID: ${verifiedUserId} not found`, 404)
				);
			}

			return Send.success(res, "User verified successfully");
		}
	);

	static getPractitionerById = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const userId = req.params.id;

			const healthPractitioner = await HealthPractitioner.findOne({
				where: { id: userId },
				attributes: { exclude: ["password"] },
			});
			if (!healthPractitioner) {
				return next(
					new AppError(`Practitioner with Id: ${userId} not found`, 404)
				);
			}

			return Send.success(
				res,
				`Health Practitioner of ID: ${userId}`,
				HpMapper.hpResponse(healthPractitioner)
			);
		}
	);

	static deletePractitioner = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const practitionerId = req.params.id;

			const practitioner = await HealthPractitioner.findOne({
				where: { id: practitionerId },
			});

			if (!practitioner) {
				return next(
					new AppError(`Practitioner with ID ${practitionerId} not found`, 404)
				);
			}

			await practitioner.destroy();

			return Send.success(
				res,
				"Practitioner deleted successfully",
				HpMapper.hpResponse(practitioner)
			);
		}
	);

	static forgotPassword = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email } = req.body;

			const passwordForgetter = await HealthPractitioner.findOne({
				where: { email },
			});
			if (!passwordForgetter) {
				return next(new AppError(`User with Email: ${email} not found`, 400));
			}

			await AuthController.forgotPassword(this.type, email, passwordForgetter.id);

			return Send.success(res, "Link to reset password sent successfully");
		}
	);

	static resetPassword = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { token } = req.query;
			const { password } = req.body;

			if (!token || typeof token !== "string") {
				return next(new AppError("Invalid or missing token", 401));
			}

			if (!password || password.length < 6) {
				return next(
					new AppError("Password must be atleast 6 characters long", 401)
				);
			}

			const decoded = AccessToken.verify(token);
			const hashedPassword = await bcrypt.hash(password, 10);

			const resetUserPassword = await HealthPractitioner.update(
				{ password: hashedPassword },
				{ where: { id: decoded.userId } }
			);

			return Send.success(res, "Password Reset successful", {
				...resetUserPassword,
			});
		}
	);

	static logout = CatchAsync.wrap(
			async (req: AuthenticateRequest, res: Response) => {
				const hpId = req.userId;
				if (hpId) {
					await HealthPractitioner.update(
						{ refresh_token: null },
						{ where: { id: hpId } }
					);
				}
	
				res.clearCookie("accessToken");
				res.clearCookie("refreshToken");
	
				return Send.success(res, "Logged out successfully", null, );
			}
		);
}

export default HpController;
