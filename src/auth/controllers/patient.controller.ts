import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import Send from "../utils/response.utils";
import { AppError, Patient } from "../../core";
import { config } from "dotenv";
import { CatchAsync } from "../../core";
import { VerificationMailer } from "../services/veryifyuser.service";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

class PatientController {
	static login = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email, password } = req.body;

			if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
				return next(new AppError("Missing environment variable", 500));
			}

			const patient = await Patient.findOne({
				where: { email },
			});
			if (!patient) {
				return next(new AppError("Invalid credential", 404));
			}

			const isPasswordValid = await bcrypt.compare(password, patient.password);
			if (!isPasswordValid) {
				return next(new AppError("Incorrect password", 401));
			}

			const accessToken = jwt.sign(
				{ userId: patient.id },
				process.env.JWT_SECRET,
				{
					expiresIn: "15m",
				}
			);

			const refreshToken = jwt.sign(
				{ userId: patient.id },
				process.env.JWT_REFRESH_TOKEN_SECRET,
				{ expiresIn: "1d" }
			);

			await patient.update({
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
				id: patient.id,
				firstname: patient.firstname,
				email: patient.email,
				createdAt: patient.createdAt,
				UpdatedAt: patient.updatedAt,
			});
		}
	);

	static register = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const { firstname, lastname, email, password } = req.body;

			const existingPatient = await Patient.findOne({
				where: { email },
			});

			if (existingPatient) {
				return next(new AppError("Email already in use", 400));
			}

			const hashedpassword = await bcrypt.hash(password, 10);

			const newUser = await Patient.create({
				email,
				firstname,
				lastname,
				password: hashedpassword,
				email_verified: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const token = "mayday mayday mayday";
			await VerificationMailer.send(email, token);

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
		}
	);
}

export default PatientController;
