"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const response_utils_1 = require("../utils/response.utils");
const dotenv_1 = require("dotenv");
const bcrypt = require("bcrypt");
const core_2 = require("../../core");
const auth_controller_1 = require("./auth.controller");
const utils_1 = require("../utils");
const config_1 = require("../config");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
class HpController {
}
_a = HpController;
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
            defaults: { email,
                firstname: given_name,
                lastname: family_name,
                hp_type_id: "c632348a-db2e-430f-a582-004c9fd773b0",
                password: null,
                email_verified,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
        return response_utils_1.default.success(res, {
            id: newUser.id,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            email: newUser.email,
            refreshToken: newUser.refresh_token,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        }, created ? "User created successfully" : "User already exists");
    }
    catch (err) {
        console.error("OAuth callback error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
HpController.login = core_2.CatchAsync.wrap(async (req, res, next) => {
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
    return response_utils_1.default.success(res, {
        id: hp.id,
        firstname: hp.firstname,
        email: hp.email,
        createdAt: hp.createdAt,
        UpdatedAt: hp.updatedAt,
    });
});
HpController.register = core_2.CatchAsync.wrap(async (req, res, next) => {
    const { firstname, lastname, hp_type_id, email, password } = req.body;
    const existingHp = await core_1.HealthPractitioner.findOne({
        where: { email },
    });
    if (existingHp) {
        return next(new core_1.AppError("Email already in use", 400));
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = await core_1.HealthPractitioner.create({
        email,
        firstname,
        lastname,
        hp_type_id,
        password: hashedpassword,
        email_verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return response_utils_1.default.success(res, {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        hp_type_id: newUser.hp_type_id,
        refreshToken: newUser.refresh_token,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    }, "User created successfully");
});
HpController.refreshAccessToken = core_2.CatchAsync.wrap(async (req, res) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing Environment variable");
    }
    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;
    const user = await core_1.HealthPractitioner.findOne({
        where: { id: userId },
    });
    if (!user || !refreshToken) {
        return response_utils_1.default.unauthorized(res, null, "Request Token not found");
    }
    if (user.refresh_token !== refreshToken) {
        return response_utils_1.default.unauthorized(res, null, "Invalid refresh token");
    }
    const accessToken = core_1.AccessToken.sign(userId);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        sameSite: "strict",
    });
    return response_utils_1.default.success(res, null, "Access Token refreshed successfully");
});
HpController.verifiedHealthPractitioner = core_2.CatchAsync.wrap(async (req, res, next) => {
    const verifiedUserId = req.userId;
    const user = await core_1.HealthPractitioner.update({ email_verified: true }, { where: { id: verifiedUserId } });
    if (!user) {
        return next(new core_1.AppError(`Practitioner of ID: ${verifiedUserId} not found`, 404));
    }
    res.status(200).json({
        message: "User verified successfully",
    });
});
HpController.getPractitionerById = core_2.CatchAsync.wrap(async (req, res, next) => {
    const userId = req.params.id;
    const healthPractitioner = await core_1.HealthPractitioner.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
    });
    if (!healthPractitioner) {
        return next(new core_1.AppError(`Practitioner with Id: ${userId} not found`, 404));
    }
    return response_utils_1.default.success(res, { healthPractitioner });
});
HpController.getAllPractitioners = core_2.CatchAsync.wrap(async (req, res, next) => {
    const allPractitioners = await core_1.HealthPractitioner.findAll();
    if (!allPractitioners) {
        return next(new core_1.AppError("No Practitioner seen", 404));
    }
    return response_utils_1.default.success(res, { allPractitioners });
});
HpController.deletePractitioner = core_2.CatchAsync.wrap(async (req, res, next) => {
    const practitionerId = req.params.id;
    const practitioner = await core_1.HealthPractitioner.findOne({
        where: { id: practitionerId },
    });
    if (!practitioner) {
        return next(new core_1.AppError(`Practitioner with ID ${practitionerId} not found`, 404));
    }
    await practitioner.destroy();
    return response_utils_1.default.success(res, null, "Practitioner deleted successfully");
});
HpController.forgotPassword = core_2.CatchAsync.wrap(async (req, res, next) => {
    const { email } = req.body;
    const passwordForgetter = await core_1.HealthPractitioner.findOne({
        where: { email }
    });
    if (!passwordForgetter) {
        return next(new core_1.AppError(`User with Email: ${email} not found`, 400));
    }
    await auth_controller_1.default.forgotPassword(email, passwordForgetter.id);
    return response_utils_1.default.success(res, null, "Link to reset password sent successfully");
});
exports.default = HpController;
//# sourceMappingURL=hp.controller.js.map