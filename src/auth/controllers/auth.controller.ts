import type { NextFunction, Request, Response } from "express";
import type { AuthenticateRequest } from "../middlewares";
import { AccessToken, AppError, Patient } from "../../core";
import Send from "../utils/response.utils";
import { config } from "dotenv";
import { CatchAsync } from "../../core";
import { buildUrl } from "../utils";
import { google } from "../config";
import { ForgotPasswordLink } from "../services";
import * as bcrypt from "bcrypt";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

class AuthController {
	static refreshToken = CatchAsync.wrap(
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

	static initializeGoogleAuth = async (_: Request, res: Response) => {
		const consent_screen = buildUrl(google);
		res.redirect(consent_screen);
	};

    static forgotPassword = async (email: string, userId: string) => {
        const token = AccessToken.sign(userId);

        await ForgotPasswordLink.send(token, email);
    };

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
		
		const resetPasswordUser = await Patient.update(
			{ password: hashedPassword },
			{ where: { id: decoded.userId } }
		);

		return Send.success(res, {...resetPasswordUser}, "Password Reset successful")
	});
}

export default AuthController;
