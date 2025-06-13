import type { Request, Response } from "express";
import { HealthPractitioner } from "../../core";
import Send from "../utils/response.utils";
import { config } from "dotenv";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local`})

class HpController {
    static login = async (req: Request, res: Response) => {
		const { email, password } = req.body;

        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
            throw new Error("Missing environment variable")
        }

		try {
			const hp = await HealthPractitioner.findOne({
				where: { email },
			});
			if (!hp) {
				return Send.error(res, null, "Invalid credentials");
			}

			const isPasswordValid = await bcrypt.compare(password, hp.password);
			if (!isPasswordValid) {
				return Send.error(res, null, "Incorrect password");
			}

			const accessToken = jwt.sign({ userId: hp.id }, process.env.JWT_SECRET, {
				expiresIn: "15m",
			});

			const refreshToken = jwt.sign(
				{ userId: hp.id },
				process.env.JWT_REFRESH_TOKEN_SECRET,
				{ expiresIn: "1d" }
			);

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
		} catch (err) {
			console.error("Error logging in: ", err);
			return Send.error(res, null, "Error logging in");
		}
	};

	static register = async (req: Request, res: Response) => {
		const { firstname, lastname, hp_type_id, email, password } = req.body;

		try {
			const existingHp = await HealthPractitioner.findOne({
				where: { email },
			});

			if (existingHp) {
				return Send.error(res, null, "Email already in use");
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
		} catch (err) {
			console.error("Error registering user: ", err);
			return Send.error(res, null, "Registration failed");
		}
	};
}

export default HpController;