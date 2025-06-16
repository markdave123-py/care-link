import type { NextFunction, Request, Response } from "express";
import { AccessToken, AppError, HealthPractitioner, RefreshToken } from "../../core";
import Send from "../utils/response.utils";
import { config } from "dotenv";
import * as bcrypt from "bcrypt";
import { CatchAsync } from "../../core";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

class HpController {
	static login = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;

		if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
			return next(new AppError("Missing environment variable", 500));
		}

		const hp = await HealthPractitioner.findOne({
			where: { email },
		});
		if (!hp) {
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

		return Send.success(res, {
			id: hp.id,
			firstname: hp.firstname,
			email: hp.email,
			createdAt: hp.createdAt,
			UpdatedAt: hp.updatedAt,
		});
	});

	static register = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
		const { firstname, lastname, hp_type_id, email, password } = req.body;

		const existingHp = await HealthPractitioner.findOne({
			where: { email },
		});

		if (existingHp) {
			return next(new AppError("Email already in use", 400));
		}

		const hashedpassword = await bcrypt.hash(password, 10);

		const newUser = await HealthPractitioner.create({
			email,
			firstname,
			lastname,
			hp_type_id,
			password: hashedpassword,
			email_verified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return Send.success(
			res,
			{
				id: newUser.id,
				firstname: newUser.firstname,
				lastname: newUser.lastname,
				email: newUser.email,
				hp_type_id: newUser.hp_type_id,
				refreshToken: newUser.refresh_token,
				createdAt: newUser.createdAt,
				updatedAt: newUser.updatedAt,
			},
			"User created successfully"
		);
	});
}

export default HpController;
