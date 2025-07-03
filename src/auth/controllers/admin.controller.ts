// import * as jwt from "jsonwebtoken";
import { AccessToken, Admin, AppError, CatchAsync } from "../../core";
import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import Send from "../utils/response.utils";
import { AdminInviteLink } from "../services/adminInvite.service";

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
			});

			return Send.success(
				res,
				{
					id: newAdmin.id,
					firstname: newAdmin.firstname,
					lastname: newAdmin.lastname,
					email: newAdmin.email,
				},
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

			// const refreshToken = RefreshToken.sign(admin.id);

			// await admin.update({
			// 	refresh_token: refreshToken,
			// });

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 15 * 60 * 1000,
				sameSite: "strict",
			});
			// res.cookie("refreshToken", refreshToken, {
			// 	httpOnly: true,
			// 	secure: process.env.NODE_ENV === "production",
			// 	maxAge: 24 * 60 * 60 * 1000,
			// 	sameSite: "strict",
			// });

			return Send.success(res, {
				id: admin.id,
				firstname: admin.firstname,
				lastname: admin.lastname,
				email: admin.email,
			});
		}
	);

    static requestAdmin = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
        if (!process.env.JWT_SECRET) {
            return next(new AppError("Missing environment variable", 500));
        }

        const { email } = req.body;
        
        // const token = jwt.sign(
        //     { email },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "15m" }
        // )
        await AdminInviteLink.send(email);

        res.json("Request sent successfully!")
    });

    static inviteAdmin = CatchAsync.wrap(async (req: Request, res: Response) => {
        res.redirect("http://localhost:3000/api/v1/auth/admin/register");
    })
}
