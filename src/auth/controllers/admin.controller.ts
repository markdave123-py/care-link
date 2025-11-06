import {
  AccessToken,
  Admin,
  AppError,
  CatchAsync,
  HealthPractitioner,
  InviteAdminToken,
  Patient,
  RefreshToken,
  Session,
} from "../../core";
import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import Send from "../utils/response.utils";
import { AdminMapper } from "../mappers/admin.mapper";
import type { AuthenticateRequest } from "../middlewares";
import AuthController from "./auth.controller";
import { buildUrl } from "../utils";
import { googleAdmin } from "../config";
import { PublishToQueue } from "../../common/rabbitmq/producer";
import { Op } from "sequelize";
import type { WhereOptions } from "sequelize";

export class AdminController {
  private static type: string = "admin";
  static initializeGoogleAuth = async (_: Request, res: Response) => {
    const consent_screen = buildUrl(googleAdmin);
    res.redirect(consent_screen);
  };

  static getAdminToken = async (req: Request, res: Response): Promise<void> => {
    console.log(req.query);

    const { code } = req.query;

    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_PATIENT_REDIRECT_URI ||
      !process.env.GOOGLE_TOKEN_ENDPOINT ||
      !code
    ) {
      res.status(400).json({ error: "Missing required OAuth parameters" });
      return;
    }

    try {
      const response = await fetch(process.env.GOOGLE_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: process.env.GOOGLE_PATIENT_REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        // Get error details from the response
        const errorText = await response.text();
        console.error("Token exchange failed:", errorText);
        res.status(400).json({
          error: "Token exchange failed",
          details: errorText,
        });
        return;
      }

      const access_token_data = await response.json();
      console.log(access_token_data);

      const { id_token } = access_token_data;

      const token_info_response = await fetch(
        `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
      );

      const { email, given_name, family_name } =
        await token_info_response.json();
      const [newUser, created] = await Admin.findOrCreate({
        where: { email },
        defaults: {
          email,
          firstname: given_name,
          lastname: family_name,
          password: null,
          refresh_token: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const accessToken = AccessToken.sign(newUser.id);
      const refreshToken = RefreshToken.sign(newUser.id);

      newUser.refresh_token = refreshToken;
      await newUser.save();

      return Send.success(
        res,
        created ? "User created successfully" : "User already exists",
        {
          ...AdminMapper.adminResponse(newUser),
          accessToken,
          refreshToken
        }
      );
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

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
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const accessToken = AccessToken.sign(newAdmin.id);
      const refreshToken = RefreshToken.sign(newAdmin.id);

      newAdmin.refresh_token = refreshToken;
      await newAdmin.save();

      return Send.success(
        res,
        "Admin created successfully",
        {
          ...AdminMapper.adminResponse(newAdmin),
          accessToken,
          refreshToken
        }
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

      return Send.success(
        res,
        "Login successfully",
        {
          ...AdminMapper.adminResponse(admin),
          accessToken,
          refreshToken
        }
      );
    }
  );

  static requestAdmin = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!process.env.JWT_INVITE_ADMIN_SECRET) {
        return next(new AppError("Missing environment variable", 500));
      }

      const { email } = req.body;
      if (!email) {
        return new AppError("No email Found", 404);
      }

      const token = InviteAdminToken.sign(email);
      const data = { token, email };
      await PublishToQueue.email("auth.admin.invite", data);

      return Send.success(res, "Request sent successfully!");
    }
  );

  static refreshAccessToken = CatchAsync.wrap(
    async (req: AuthenticateRequest, res: Response) => {
      if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing Environment variable");
      }

      const userId = req.userId;
      const refreshToken = req.headers['x-refresh-token'] as string;

      const user = await Admin.findOne({
        where: { id: userId },
      });

      if (!user || !refreshToken) {
        return Send.unauthorized(res, "Request Token not found");
      }
      if (user.refresh_token !== refreshToken) {
        return Send.unauthorized(res, "Invalid refresh token");
      }

      const accessToken = AccessToken.sign(userId);

      return Send.success(res, "Access Token refreshed successfully", {
        accessToken
      });
    }
  );

  static logout = CatchAsync.wrap(
    async (req: AuthenticateRequest, res: Response) => {
      const adminId = req.userId;
      if (adminId) {
        await Admin.update(
          { refresh_token: null },
          { where: { id: adminId } }
        );
      }

      return Send.success(res, "Logged out successfully");
    }
  );

  static inviteAdmin = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
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

      const { firstname, lastname, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await Admin.create({
        email: payload.email,
        firstname,
        lastname,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const accessToken = AccessToken.sign(newAdmin.id);
      const refreshToken = RefreshToken.sign(newAdmin.id);

      newAdmin.refresh_token = refreshToken;
      await newAdmin.save();

      return Send.success(
        res,
        "Admin created successfully",
        AdminMapper.adminResponse(newAdmin)
      );
    }
  );

  static getAdminById = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;

      const admin = await Admin.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
      });
      if (!admin) {
        return next(new AppError(`Admin with Id: ${userId} not found`, 404));
      }

      return Send.success(
        res,
        `Admin with ID: ${userId}`,
        AdminMapper.adminResponse(admin)
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
        return next(new AppError(`Patient with Id: ${userId} not found`, 404));
      }
      return Send.success(
        res,
        `Patient with ID: ${userId}`,
        {...patient},
      );
    }
  );

  static getPractitionerById = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const hp = await HealthPractitioner.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
      });
      if (!hp) {
        return next(new AppError(`Health Practitioner with Id: ${userId} not found`, 404));
      }
      return Send.success(
        res,
        `Health Practitioner with ID: ${userId}`,
        {...hp},
      );
    }
  );

  static getAllAdmins = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const allAdmins = await Admin.findAll({
        attributes: { exclude: ["password"] },
      });
      if (!allAdmins) {
        return next(new AppError("No Admin seen", 404));
      }

      return Send.success(res, "All Admins", allAdmins);
    }
  );

  static deleteAdmin = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const adminId = req.params.id;

      const admin = await Admin.findOne({
        where: { id: adminId },
      });

      if (!admin) {
        return next(new AppError(`Patient with ID ${adminId} not found`, 404));
      }

      await admin.destroy();

      return Send.success(
        res,
        "Admin deleted successfully",
        AdminMapper.adminResponse(admin)
      );
    }
  );

  static forgotPassword = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      const passwordForgetter = await Admin.findOne({
        where: { email },
      });
      if (!passwordForgetter) {
        return next(new AppError(`User with Email: ${email} not found`, 404));
      }

      await AuthController.forgotPassword(
        this.type,
        email,
        passwordForgetter.id
      );

      return Send.success(res, "Link to reset password sent successfully");
    }
  );

  static resetPassword = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token } = req.query;
      const { password } = req.body;

      if (!token || typeof token !== "string") {
        return next(new AppError("Invalid or missing token", 401));
      }

      if (!password || password.length < 6) {
        return next(
          new AppError("Password must be atleast 6 characters long", 401)
        );
      }

      const decoded = AccessToken.verify(token);
      const hashedPassword = await bcrypt.hash(password, 10);

      const resetUserPassword = await Admin.update(
        { password: hashedPassword },
        { where: { id: decoded.userId } }
      );

      return Send.success(res, "Password Reset successful", {
        ...resetUserPassword,
      });
    }
  );

  static getAllPatients = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const allPatients = await Patient.findAll({
        attributes: { exclude: ["password"] },
      });
      if (!allPatients) {
        return next(new AppError("No Patient seen", 404));
      }

      return Send.success(res, "All Patients", [...allPatients]);
    }
  );

  static getAllPractitioners = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const allPractitioners = await HealthPractitioner.findAll({
        attributes: { exclude: ["password"] },
      });
      if (!allPractitioners) {
        return next(new AppError("No Practitioner seen", 404));
      }

      return Send.success(res, "All Health Practitioners", {
        allPractitioners,
      });
    }
  );

  static searchPatientByEmailOrName = CatchAsync.wrap(
	async (req: Request, res: Response) => {
		const { name, email } = req.query;

		if (!name && !email) {
			throw new AppError(`Input your name or email`, 400);
		};

		const patient = await Patient.findAll(
			{ where: {
				[Op.or]: [
					email ? { email: { [Op.iLike]: `%${email}%` } }: undefined,
					name ? { firstname: { [Op.iLike]: `%${name}%` } }: undefined,
          name ? { lastname: { [Op.iLike]: `%${name}%` } }: undefined,
				].filter(Boolean) as WhereOptions<Patient>[],
			}},
		);
		if (!patient) {
			return Send.success(res, "Patient Not Found")
		};

		return Send.success(
			res,
			"Patient(s) found are..",
			[...patient]
		)
	}
  );

  static searchPractitionerByEmailOrName = CatchAsync.wrap(
	async (req: Request, res: Response) => {
		const { name, email } = req.query;

		if (!name && !email) {
			throw new AppError(`Input your name or email`, 400);
		};

		const hp = await HealthPractitioner.findAll(
			{ where: {
				[Op.or]: [
					email ? { email: { [Op.iLike]: `%${email}%` } }: undefined,
					name ? { firstname: { [Op.iLike]: `%${name}%` } }: undefined,
          name ? { lastname: { [Op.iLike]: `%${name}%` } }: undefined,
				].filter(Boolean) as WhereOptions<HealthPractitioner>[],
			}},
		);
		if (!hp) {
			return Send.success(res, "Practitioner Not Found")
		};

		return Send.success(
			res,
			"Practitioner(s) found are..",
			[...hp]
		)
	}
  );

  static deletePatient = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const patientId = req.params.id;
      const patient = await Patient.findOne({
        where: { id: patientId },
      });
      if (!patient) {
        return next(new AppError(`Patient with ID ${patientId} not found`, 404));
      }
      await patient.destroy();

      return Send.success(
        res,
        "Patient deleted successfully",
        { ...patient }
      );
    }
  );

  static deletePractitioner = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const practitionerId = req.params.id;
      const practitioner = await HealthPractitioner.findOne({
        where: { id: practitionerId },
      });
      if (!practitioner) {
        return next(new AppError(`Health Practitioner with ID ${practitionerId} not found`, 404));
      }
      await practitioner.destroy();
      return Send.success(
        res,
        "Health Practitioner deleted successfully",
        { ...practitioner }
      );
    }
  );

  static getSessions = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const sessions = await Session.findAll();
      if (!sessions) {
        return next(new AppError("No sessions found", 404));
      }
      return Send.success(
        res,
        "All sessions retrieved successfully",
        sessions
      );
    }
  );

  static getHPSessions = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const hp_id = req.params.hp_id;
      const sessions = await Session.findAll({where: {health_practitioner_id: hp_id}});
      if (!sessions) {
        return next(new AppError("No sessions found for this health practitioner", 404));
      }
      return Send.success(
        res,
        "Health Practitioner sessions retrieved successfully",
        sessions
      );
    }
  );

  static getPatientSessions = CatchAsync.wrap(
    async (req: Request, res: Response, next: NextFunction) => {
      const patient_id = req.params.patient_id;
      const sessions = await Session.findAll({where: {patient_id}});
      if (!sessions) {
        return next(new AppError("No sessions found for this patient", 404));
      }
      return Send.success(
        res,
        "Patient sessions retrieved successfully",
        sessions
      );
    }
  );

}
