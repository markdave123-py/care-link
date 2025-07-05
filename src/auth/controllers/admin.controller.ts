import {
	AccessToken,
	Admin,
	AppError,
	CatchAsync,
	InviteAdminToken,
	RefreshToken,
} from "../../core";
import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import Send from "../utils/response.utils";
import { AdminInviteLink } from "../services/adminInvite.service";
import { AdminMapper } from "../mappers/admin.mapper";
import type { AuthenticateRequest } from "../middlewares";

export class AdminController {
	static register = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email, firstname, lastname, password } = req.body;

			const existingAdmin = await Admin.findOne({
				where: { email },
			});
			if (existingAdmin) {
				return next(new AppError("Email already in use", 400));
			}

			const hashedpassword = await bcrypt.hash(password, 10);

			const newAdmin = await Admin.create({
				email,
				firstname,
				lastname,
				password: hashedpassword,
				refresh_token: null,
			});

			const accessToken = AccessToken.sign(newAdmin.id);
			const refreshToken = RefreshToken.sign(newAdmin.id);

			newAdmin.refresh_token = refreshToken;
			await newAdmin.save();

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
				AdminMapper.adminResponse(newAdmin),
				"Admin created successfully"
			);
		}
	);

	static login = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email, password } = req.body;

			if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			const admin = await Admin.findOne({
				where: { email },
			});
			if (!admin?.password) {
				return next(new AppError("Invalid credential", 404));
			}

			const isPasswordValid = await bcrypt.compare(password, admin.password);
			if (!isPasswordValid) {
				return next(new AppError("Incorrect password", 401));
			}

			const accessToken = AccessToken.sign(admin.id);
			const refreshToken = RefreshToken.sign(admin.id);

			await admin.update({
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
				maxAge: 7 * 24 * 60 * 60 * 1000,
				sameSite: "strict",
			});

			return Send.success(res, AdminMapper.adminResponse(admin));
		}
	);

	static requestAdmin = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			if (!process.env.JWT_INVITE_ADMIN_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			const { email } = req.body;

			const token = InviteAdminToken.sign(email)
			await AdminInviteLink.send(email, token);

			res.json("Request sent successfully!");
		}
	);

	static refreshAccessToken = CatchAsync.wrap(
		async (req: AuthenticateRequest, res: Response) => {
			if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
				throw new Error("Missing Environment variable");
			}

			const userId = req.userId;
			const refreshToken = req.cookies.refreshToken;

			const user = await Admin.findOne({
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
				await Admin.update(
					{ refresh_token: null },
					{ where: { id: patientId } }
				);
			}

			res.clearCookie("accessToken");
			res.clearCookie("refreshToken");

			return Send.success(res, null, "Logged out successfully");
		}
	);

	static inviteAdmin = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
		const { token } = req.query;

		if (!token || typeof token !== "string") {
			return next(new AppError("No invite token provided", 400));
		}

		const payload = InviteAdminToken.verify(token);

		const existingAdmin = await Admin.findOne({
			where: { email: payload.email },
		});
		if (existingAdmin) {
			return next(new AppError("User is already an admin", 400));
		}

		// Continue with admin creation (based on body inputs)
		const { firstname, lastname, password } = req.body;

		const hashedPassword = await bcrypt.hash(password, 10);

		const newAdmin = await Admin.create({
			email: payload.email,
			firstname,
			lastname,
			password: hashedPassword,
		});

		return Send.success(
			res,
			AdminMapper.adminResponse(newAdmin),
			"Admin created successfully"
		);
	});
}
