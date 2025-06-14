import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import Send from "../utils/response.utils";
import { config } from "dotenv";
import { CatchAsync } from "../../core";
import { AppError } from "../../core";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export type AuthenticateRequest = Request & {
	userId: string;
};

export interface DecodedToken {
	userId: string;
}

class AuthMiddleware {
	/**
	 * Middleware to authenticate the user based on the access token stored in the HttpOnly cookie.
	 * This middleware will verify the access token and attach the user information to the request object.
	 */
	static authenticateUser = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const token = req.cookies.accessToken;

			if (!process.env.JWT_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			if (!token) {
				return Send.unauthorized(res, null);
			}

			const decodedToken = jwt.verify(
				token,
				process.env.JWT_SECRET
			) as DecodedToken;

			req.userId = decodedToken.userId;
			next();
		}
	);

	static refreshTokenValidation = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const token = req.cookies.refreshToken;

			if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			if (!token) {
				return Send.unauthorized(res, { message: "No refresh token provided" });
			}

			const decodedToken = jwt.verify(
				token,
				process.env.JWT_REFRESH_TOKEN_SECRET
			) as DecodedToken;

			req.userId = decodedToken.userId;
			next();
		}
	);
}

export default AuthMiddleware;
