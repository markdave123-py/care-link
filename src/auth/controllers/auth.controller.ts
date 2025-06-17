import type { Request, Response } from "express";
import type { AuthenticateRequest } from "../middlewares";
import { AccessToken, Patient } from "../../core";
import Send from "../utils/response.utils";
import { config } from "dotenv";
import { CatchAsync } from "../../core";
import { buildUrl } from "../utils";
import { google } from "../config";
import { ForgotPasswordLink } from "../services";

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

	static getToken = async (req: Request, res: Response): Promise<void> => {
		console.log(req.query);

		const { code } = req.query;

		if (
			!process.env.GOOGLE_CLIENT_ID ||
			!process.env.GOOGLE_CLIENT_SECRET ||
			!process.env.GOOGLE_REDIRECT_URI ||
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

            const { email, given_name, family_name, email_verified } = await token_info_response.json();
            const newUser = await Patient.create({
                email,
                firstname: given_name,
                lastname: family_name,
                password: "null",
                email_verified,
                createdAt: new Date(),
                updatedAt: new Date(),
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
				"User created successfully"
			);
		} catch (err) {
			console.error("OAuth callback error:", err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

    static forgotPassword = async (email: string, userId: string) => {
        const token = AccessToken.sign(userId);

        await ForgotPasswordLink.send(token, email);
    }
}

export default AuthController;
