import type { Response } from "express";
import type { AuthenticateRequest } from "../middlewares";
import { Patient } from "../../core";
import Send from "../utils/response.utils";
import * as jwt from "jsonwebtoken";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local`})

class AuthController {
    static refreshToken = async (req: AuthenticateRequest, res: Response) => {
        if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
            throw new Error("Missing Environment variable")
        };

        try {

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
    
            const accessToken = jwt.sign(
                { userId },
                process.env.JWT_REFRESH_TOKEN_SECRET,
                { expiresIn: "15m" }
            );
    
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000,
                sameSite: "strict"
            });
    
            return Send.success(res, null, "Access Token refreshed successfully")
        } catch(err) {
            console.error("Error creating access token: ", err);
            return Send.error(res, null, "Error creating access token")
        }
    }
}

export default AuthController;