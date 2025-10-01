import type { NextFunction, Request, Response } from "express";
import type { AuthenticateRequest } from "../middlewares";
import { AccessToken, AppError, Patient } from "../../core";
import Send from "../utils/response.utils";
import { config } from "dotenv";
import * as bcrypt from "bcrypt";
import { PublishToQueue } from "../../common/rabbitmq/producer";
import { CatchAsync } from '../../core/utils'

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

class AuthController {
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
				return Send.unauthorized(res,"Request Token not found", null);
			}
			if (user.refresh_token !== refreshToken) {
				return Send.unauthorized(res,"Invalid refresh token", null, );
			}

			const accessToken = AccessToken.sign(userId);

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 15 * 60 * 1000,
				sameSite: process.env.NODE_ENV === "production"? "none" : "lax",
			});

			return Send.success(res, "Access Token refreshed successfully", null, );
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

			return Send.success(res, "Logged out successfully", null, );
		}
	);

    static forgotPassword = async (type: string, email: string, userId: string) => {
        const token = AccessToken.sign(userId);
		const data = { token, email, type };
		const key = "auth.patient.forgotpassword"; // routing_key for rabbitmq
		await PublishToQueue.email(key, data);
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

		return Send.success(res, "Password Reset successful", {...resetPasswordUser},)
	});
}

export default AuthController;
