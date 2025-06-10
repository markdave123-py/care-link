import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import Send from "../utils/response.utils";
import { env } from "../config";

export type AuthenticateRequest = Request & {
  userId: number,
}

export interface DecodedToken {
    userId: number,
}

class AuthMiddleware {
    /**
     * Middleware to authenticate the user based on the access token stored in the HttpOnly cookie.
     * This middleware will verify the access token and attach the user information to the request object.
     */
    static authenticateUser = (req: AuthenticateRequest, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken;

        if (!token) {
            return Send.unauthorized(res, null);
        }

        try {
            const decodedToken = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

            req.userId = decodedToken.userId;
            next();
        } catch (err) {
            console.error("Authentication failed:", err);
            return Send.unauthorized(res, null)
        }
    }

    static refreshTokenValidation = (req: AuthenticateRequest, res: Response, next: NextFunction) => {
        const token = req.cookies.refreshToken;

        if (!token) {
            return Send.unauthorized(res, {message: "No refresh token provided"});
        }

        try {
            const decodedToken = jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET) as DecodedToken;

            req.userId = decodedToken.userId;
            next();
        } catch (err) {
            console.error("Refresh token authentication failed:", err);
            return Send.unauthorized(res, { message: "Invalid or expired token" })
        }
    }
}

export default AuthMiddleware;