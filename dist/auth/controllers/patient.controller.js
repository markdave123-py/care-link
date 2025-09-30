"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const response_utils_1 = require("../utils/response.utils");
const core_1 = require("../../core");
const dotenv_1 = require("dotenv");
const auth_controller_1 = require("./auth.controller");
const utils_1 = require("../utils");
const config_1 = require("../config");
const patient_mapper_1 = require("../mappers/patient.mapper");
const producer_1 = require("../../common/rabbitmq/producer");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
class PatientController {
}
_a = PatientController;
PatientController.type = "patient";
PatientController.initializeGoogleAuth = async (_, res) => {
    const consent_screen = (0, utils_1.buildUrl)(config_1.googlePatient);
    res.redirect(consent_screen);
};
PatientController.getPatientToken = async (req, res) => {
    console.log(req.query);
    const { code } = req.query;
    if (!process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_PATIENT_REDIRECT_URI ||
        !process.env.GOOGLE_TOKEN_ENDPOINT ||
        !code) {
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
                code: code,
                grant_type: "authorization_code",
                redirect_uri: process.env.GOOGLE_PATIENT_REDIRECT_URI,
            }),
        });
        if (!response.ok) {
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
        const token_info_response = await fetch(`${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`);
        const { email, given_name, family_name, email_verified } = await token_info_response.json();
        const [newUser, created] = await core_1.Patient.findOrCreate({
            where: { email },
            defaults: { email,
                firstname: given_name,
                lastname: family_name,
                password: null,
                refresh_token: "",
                email_verified,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
        const accessToken = core_1.AccessToken.sign(newUser.id);
        const refreshToken = core_1.RefreshToken.sign(newUser.id);
        newUser.refresh_token = refreshToken;
        await newUser.save();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return response_utils_1.default.success(res, created ? "User created successfully" : "User already exists", patient_mapper_1.PatientMapper.patientResponse(newUser));
    }
    catch (err) {
        console.error("OAuth callback error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
PatientController.login = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
        return next(new core_1.AppError("Missing environment variable", 500));
    }
    const patient = await core_1.Patient.findOne({
        where: { email },
    });
    if (!(patient === null || patient === void 0 ? void 0 : patient.password)) {
        return next(new core_1.AppError("Invalid credentials", 401));
    }
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
        return next(new core_1.AppError("Incorrect password", 401));
    }
    const accessToken = core_1.AccessToken.sign(patient.id);
    const refreshToken = core_1.RefreshToken.sign(patient.id);
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
    return response_utils_1.default.success(res, "Logged in successfully", patient_mapper_1.PatientMapper.patientResponse(patient));
});
PatientController.register = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { firstname, lastname, email, password } = req.body;
    const existingPatient = await core_1.Patient.findOne({
        where: { email },
    });
    if (existingPatient) {
        return next(new core_1.AppError("Email already in use", 400));
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const newPatient = await core_1.Patient.create({
        email,
        firstname,
        lastname,
        password: hashedpassword,
        email_verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const accessToken = core_1.AccessToken.sign(newPatient.id);
    const refreshToken = core_1.RefreshToken.sign(newPatient.id);
    newPatient.refresh_token = refreshToken;
    await newPatient.save();
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const type = "patient";
    const token = core_1.EmailVerificationToken.sign(newPatient.id);
    const data = { token, email, type };
    const key = "auth.patient.register";
    await producer_1.PublishToQueue.email(key, data);
    return response_utils_1.default.success(res, "User created successfully", patient_mapper_1.PatientMapper.patientResponse(newPatient));
});
PatientController.refreshAccessToken = core_1.CatchAsync.wrap(async (req, res) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing Environment variable");
    }
    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;
    const user = await core_1.Patient.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] }
    });
    if (!user || !refreshToken) {
        return response_utils_1.default.unauthorized(res, "Request Token not found");
    }
    if (user.refresh_token !== refreshToken) {
        return response_utils_1.default.unauthorized(res, "Invalid refresh token");
    }
    const accessToken = core_1.AccessToken.sign(userId);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        sameSite: "strict",
    });
    return response_utils_1.default.success(res, "Access Token refreshed successfully", Object.assign({}, user));
});
PatientController.verifiedPatient = core_1.CatchAsync.wrap(async (req, res, next) => {
    const verifiedUserId = req.userId;
    const user = await core_1.Patient.update({ email_verified: true }, {
        where: { id: verifiedUserId },
    });
    if (!user) {
        return next(new core_1.AppError(`User of ID: ${verifiedUserId} not found`, 404));
    }
    return response_utils_1.default.success(res, "User verified successfully");
});
PatientController.getPatientById = core_1.CatchAsync.wrap(async (req, res, next) => {
    const userId = req.params.id;
    const patient = await core_1.Patient.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
    });
    if (!patient) {
        return next(new core_1.AppError(`Patient with Id: ${userId} not found`, 404));
    }
    return response_utils_1.default.success(res, `Patient with ID: ${userId}`, Object.assign({}, patient));
});
PatientController.deletePatient = core_1.CatchAsync.wrap(async (req, res, next) => {
    const patientId = req.params.id;
    const patient = await core_1.Patient.findOne({
        where: { id: patientId },
        attributes: { exclude: ["password"] },
    });
    if (!patient) {
        return next(new core_1.AppError(`Patient with ID ${patientId} not found`, 404));
    }
    await patient.destroy();
    return response_utils_1.default.success(res, "Patient deleted successfully", Object.assign({}, patient));
});
PatientController.forgotPassword = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { email } = req.body;
    const passwordForgetter = await core_1.Patient.findOne({
        where: { email }
    });
    if (!passwordForgetter) {
        return next(new core_1.AppError(`User with Email: ${email} not found`, 404));
    }
    await auth_controller_1.default.forgotPassword(_a.type, email, passwordForgetter.id);
    return response_utils_1.default.success(res, "Link to reset password sent successfully");
});
PatientController.resetPassword = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!token || typeof (token) !== "string") {
        return next(new core_1.AppError("Invalid or missing token", 401));
    }
    ;
    if (!password || password.length < 6) {
        return next(new core_1.AppError("Password must be atleast 6 characters long", 401));
    }
    ;
    const decoded = core_1.AccessToken.verify(token);
    const hashedPassword = await bcrypt.hash(password, 10);
    const resetUserPassword = await core_1.Patient.update({ password: hashedPassword }, { where: { id: decoded.userId } });
    return response_utils_1.default.success(res, "Password Reset successful", Object.assign({}, resetUserPassword));
});
exports.default = PatientController;
//# sourceMappingURL=patient.controller.js.map