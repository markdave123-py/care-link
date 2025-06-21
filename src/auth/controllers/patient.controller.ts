import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import Send from "../utils/response.utils";
import { AccessToken, AppError, EmailVerificationToken, Patient, RefreshToken } from "../../core";
import { config } from "dotenv";
import { CatchAsync } from "../../core";
import { VerificationMailer } from "../services";
import AuthController from "./auth.controller";

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

			const accessToken = AccessToken.sign(patient.id);

			const refreshToken = RefreshToken.sign(patient.id);

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

			const token = EmailVerificationToken.sign(newUser.id);
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

	static getPatientById = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const userId = req.params.id;

			const patient = await Patient.findOne({
				where: { id: userId },
				attributes: { exclude: ["password"] },
			});
			if (!patient) {
				return next(
					new AppError(`Patient with Id: ${userId} not found`, 404)
				);
			}

			return Send.success(res, { patient });
		}
	);

	static getAllPatients = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const allPatients = await Patient.findAll();
			if (!allPatients) {
				return next(new AppError("No Patient seen", 404));
			}

			return Send.success(res, { allPatients });
		}
	);

	static deletePatient = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const patientId = req.params.id;

			const patient = await Patient.findOne({
				where: { id: patientId },
			});

			if (!patient) {
				return next(
					new AppError(`Patient with ID ${patientId} not found`, 404)
				);
			}

			await patient.destroy();

			return Send.success(res, null, "Patient deleted successfully");
		}
	);

	static forgotPassword = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
		const { email } = req.body;

		const passwordForgetter = await Patient.findOne({
			where: { email }
		});
		if (!passwordForgetter) {
			return next(new AppError(`User with Email: ${email} not found`, 404))
		}
		
		await AuthController.forgotPassword(email, passwordForgetter.id)

		return Send.success(res, null, "Link to reset password sent successfully")
	});
}

export default PatientController;
