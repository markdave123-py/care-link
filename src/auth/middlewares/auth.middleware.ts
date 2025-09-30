import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import Send from "../utils/response.utils";
import { config } from "dotenv";
import { Admin, CatchAsync, EmailVerificationToken, HealthPractitioner, Patient } from "../../core";
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
				return Send.unauthorized(res,"you are unauthorized", null);
			}

			const decodedToken = jwt.verify(
				token,
				process.env.JWT_SECRET
			) as DecodedToken;
			req.userId = decodedToken.userId;
			next();
		}
	);

	static authenticatePatient = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const token = req.cookies.accessToken;

			if (!process.env.JWT_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			if (!token) {
				return Send.unauthorized(res, "you are unauthorized",null);
			}

			const decodedToken = jwt.verify(
				token,
				process.env.JWT_SECRET
			) as DecodedToken;

			const userId = decodedToken.userId;
			const patient = await Patient.findOne({
				where: { id: userId }
			});

			if (!patient) {
				return next(new AppError("You are not a patient", 401));
			}
			next();
		}
	);

	static authenticateHp = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const token = req.cookies.accessToken;

			if (!process.env.JWT_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			if (!token) {
				return Send.unauthorized(res, "you are unauthorized",null);
			}

			const decodedToken = jwt.verify(
				token,
				process.env.JWT_SECRET
			) as DecodedToken;
			console.log(decodedToken)

			const userId = decodedToken.userId;
			const hp = await HealthPractitioner.findOne({
				where: { id: userId }
			});

			if (!hp) {
				return next(new AppError("You are not a Health Practitioner", 401));
			}
			next();
		}
	);

	static authenticateAdmin = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const token = req.cookies.accessToken;

			if (!process.env.JWT_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			if (!token) {
				return Send.unauthorized(res, "you are unauthorized",null);
			}

			const decodedToken = jwt.verify(
				token,
				process.env.JWT_SECRET
			) as DecodedToken;
			console.log(decodedToken)

			const userId = decodedToken.userId;
			const admin = await Admin.findOne({
				where: { id: userId }
			});

			if (!admin) {
				return next(new AppError("You are not an admin", 401));
			}
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
				return Send.unauthorized(res, "unauthorized",{ message: "No refresh token provided" });
			}

			const decodedToken = jwt.verify(
				token,
				process.env.JWT_REFRESH_TOKEN_SECRET
			) as DecodedToken;

			req.userId = decodedToken.userId;
			next();
		}
	);

	static verifyUserEmail = CatchAsync.wrap(
		async(req: AuthenticateRequest, res: Response, next: NextFunction) => {
			const token = req.query.token as string;
			if (!token) {
				return next(new AppError("Missing token from URL", 500));
			}
			const decodedToken = EmailVerificationToken.verify(token) as DecodedToken;

			req.userId = decodedToken.userId;
			
			next();
		}
	);
}

export default AuthMiddleware;
