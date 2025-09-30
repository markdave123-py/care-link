"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const response_utils_1 = require("../utils/response.utils");
const dotenv_1 = require("dotenv");
const bcrypt = require("bcrypt");
const auth_controller_1 = require("./auth.controller");
const utils_1 = require("../utils");
const config_1 = require("../config");
const validation_1 = require("../../common/validation");
const upload_1 = require("../../common/upload");
const hp_mapper_1 = require("../mappers/hp.mapper");
const producer_1 = require("../../common/rabbitmq/producer");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
class HpController {
}
_a = HpController;
HpController.type = "hp";
HpController.initializeGoogleAuth = async (_, res) => {
    const consent_screen = (0, utils_1.buildUrl)(config_1.googleHp);
    res.redirect(consent_screen);
};
HpController.getPractitionerToken = async (req, res) => {
    console.log(req.query);
    const { code } = req.query;
    if (!process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_HP_REDIRECT_URI ||
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
                redirect_uri: process.env.GOOGLE_HP_REDIRECT_URI,
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
        const [newUser, created] = await core_1.HealthPractitioner.findOrCreate({
            where: { email },
            defaults: {
                email,
                firstname: given_name,
                lastname: family_name,
                hp_type_id: "c632348a-db2e-430f-a582-004c9fd773b0",
                refresh_token: "",
                password: null,
                email_verified,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
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
        return response_utils_1.default.success(res, created ? "User created successfully" : "User already exists", hp_mapper_1.HpMapper.hpResponse(newUser));
    }
    catch (err) {
        console.error("OAuth callback error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
HpController.login = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
        return next(new core_1.AppError("Missing environment variable", 500));
    }
    const hp = await core_1.HealthPractitioner.findOne({
        where: { email },
    });
    if (!(hp === null || hp === void 0 ? void 0 : hp.password)) {
        return next(new core_1.AppError("Invalid credentials", 401));
    }
    const isPasswordValid = await bcrypt.compare(password, hp.password);
    if (!isPasswordValid) {
        return next(new core_1.AppError("Incorrect password", 401));
    }
    const accessToken = core_1.AccessToken.sign(hp.id);
    const refreshToken = core_1.RefreshToken.sign(hp.id);
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
    return response_utils_1.default.success(res, "User Logged in successfully", hp_mapper_1.HpMapper.hpResponse(hp));
});
HpController.register = core_1.CatchAsync.wrap(async (req, res, next) => {
    (0, validation_1.requireFields)(req.body, next, "firstname", "lastname", "hp_type_id", "email", "password");
    const { firstname, lastname, hp_type_id, email, password } = req.body;
    const existingHp = await core_1.HealthPractitioner.findOne({
        where: { email },
    });
    if (existingHp) {
        return next(new core_1.AppError("Email already in use", 400));
    }
    const hptype = await core_1.HPType.findOne({
        where: { id: hp_type_id }
    });
    if (!hptype)
        return next(new core_1.AppError("Invalid health practitioner type", 404));
    const docUrls = await (0, upload_1.processFiles)(req.files, {
        profile_picture: "profile_picture",
        passport: "passport",
        idcard: "idcard",
    });
    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = await core_1.HealthPractitioner.create({
        email,
        firstname,
        lastname,
        hp_type_id,
        password: hashedpassword,
        passport: docUrls.passport,
        profile_picture: docUrls.profile_picture,
        idcard: docUrls.idcard,
        refresh_token: "",
        email_verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
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
    const type = "hp";
    const token = core_1.EmailVerificationToken.sign(newUser.id);
    const data = { email, token, type };
    const key = "auth.hp.register";
    await producer_1.PublishToQueue.email(key, data);
    return response_utils_1.default.success(res, "User created successfully", {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        hp_type_id: newUser.hp_type_id,
        refreshToken: newUser.refresh_token,
        passport: newUser.passport,
        profile_picture: newUser.profile_picture,
        idcard: newUser.idcard,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    });
});
HpController.refreshAccessToken = core_1.CatchAsync.wrap(async (req, res) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing Environment variable");
    }
    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;
    const user = await core_1.HealthPractitioner.findOne({
        where: { id: userId },
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
    return response_utils_1.default.success(res, "Access Token refreshed successfully");
});
HpController.verifiedHealthPractitioner = core_1.CatchAsync.wrap(async (req, res, next) => {
    const verifiedUserId = req.userId;
    const user = await core_1.HealthPractitioner.update({ email_verified: true }, { where: { id: verifiedUserId } });
    if (!user) {
        return next(new core_1.AppError(`Practitioner of ID: ${verifiedUserId} not found`, 404));
    }
    return response_utils_1.default.success(res, "User verified successfully");
});
HpController.getPractitionerById = core_1.CatchAsync.wrap(async (req, res, next) => {
    const userId = req.params.id;
    const healthPractitioner = await core_1.HealthPractitioner.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
    });
    if (!healthPractitioner) {
        return next(new core_1.AppError(`Practitioner with Id: ${userId} not found`, 404));
    }
    return response_utils_1.default.success(res, `Health Practitioner of ID: ${userId}`, hp_mapper_1.HpMapper.hpResponse(healthPractitioner));
});
HpController.deletePractitioner = core_1.CatchAsync.wrap(async (req, res, next) => {
    const practitionerId = req.params.id;
    const practitioner = await core_1.HealthPractitioner.findOne({
        where: { id: practitionerId },
    });
    if (!practitioner) {
        return next(new core_1.AppError(`Practitioner with ID ${practitionerId} not found`, 404));
    }
    await practitioner.destroy();
    return response_utils_1.default.success(res, "Practitioner deleted successfully", hp_mapper_1.HpMapper.hpResponse(practitioner));
});
HpController.forgotPassword = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { email } = req.body;
    const passwordForgetter = await core_1.HealthPractitioner.findOne({
        where: { email },
    });
    if (!passwordForgetter) {
        return next(new core_1.AppError(`User with Email: ${email} not found`, 400));
    }
    await auth_controller_1.default.forgotPassword(_a.type, email, passwordForgetter.id);
    return response_utils_1.default.success(res, "Link to reset password sent successfully");
});
HpController.resetPassword = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!token || typeof token !== "string") {
        return next(new core_1.AppError("Invalid or missing token", 401));
    }
    if (!password || password.length < 6) {
        return next(new core_1.AppError("Password must be atleast 6 characters long", 401));
    }
    const decoded = core_1.AccessToken.verify(token);
    const hashedPassword = await bcrypt.hash(password, 10);
    const resetUserPassword = await core_1.HealthPractitioner.update({ password: hashedPassword }, { where: { id: decoded.userId } });
    return response_utils_1.default.success(res, "Password Reset successful", Object.assign({}, resetUserPassword));
});
HpController.logout = core_1.CatchAsync.wrap(async (req, res) => {
    const hpId = req.userId;
    if (hpId) {
        await core_1.HealthPractitioner.update({ refresh_token: null }, { where: { id: hpId } });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response_utils_1.default.success(res, "Logged out successfully", null);
});
exports.default = HpController;
//# sourceMappingURL=hp.controller.js.map