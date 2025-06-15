import type { Response } from "express";
import type { AuthenticateRequest } from "../middlewares";
import { AccessToken, Patient } from "../../core";
import Send from "../utils/response.utils";
import { config } from "dotenv";
import { CatchAsync } from "../../core";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local`})

class AuthController {
    static refreshToken = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response) => {
        if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
            throw new Error("Missing Environment variable")
        };

            const userId = req.userId;
            const refreshToken = req.cookies.refreshToken;
    
    
            const user = await Patient.findOne({
                where: { id: userId }
            });

            if (!user || !refreshToken) {
                return Send.unauthorized(res, null, "Request Token not found")
            };
            if (user.refresh_token !== refreshToken) {
                return Send.unauthorized(res, null, "Invalid refresh token")
            }

            const accessToken = AccessToken.sign(userId);
    
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000,
                sameSite: "strict"
            });
    
            return Send.success(res, null, "Access Token refreshed successfully")
    });

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
}

export default AuthController;