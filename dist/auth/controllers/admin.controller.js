"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const core_1 = require("../../core");
const bcrypt = require("bcrypt");
const response_utils_1 = require("../utils/response.utils");
const admin_mapper_1 = require("../mappers/admin.mapper");
const auth_controller_1 = require("./auth.controller");
const utils_1 = require("../utils");
const config_1 = require("../config");
const producer_1 = require("../../common/rabbitmq/producer");
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
AdminController.type = "admin";
AdminController.initializeGoogleAuth = async (_, res) => {
    const consent_screen = (0, utils_1.buildUrl)(config_1.googlePatient);
    res.redirect(consent_screen);
};
AdminController.getPatientToken = async (req, res) => {
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
        const { email, given_name, family_name } = await token_info_response.json();
        const [newUser, created] = await core_1.Admin.findOrCreate({
            where: { email },
            defaults: { email,
                firstname: given_name,
                lastname: family_name,
                password: null,
                refresh_token: null,
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
        return response_utils_1.default.success(res, created ? "User created successfully" : "User already exists", admin_mapper_1.AdminMapper.adminResponse(newUser));
    }
    catch (err) {
        console.error("OAuth callback error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
AdminController.register = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { email, firstname, lastname, password } = req.body;
    const existingAdmin = await core_1.Admin.findOne({
        where: { email },
    });
    if (existingAdmin) {
        return next(new core_1.AppError("Email already in use", 400));
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const newAdmin = await core_1.Admin.create({
        email,
        firstname,
        lastname,
        password: hashedpassword,
        refresh_token: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const accessToken = core_1.AccessToken.sign(newAdmin.id);
    const refreshToken = core_1.RefreshToken.sign(newAdmin.id);
    newAdmin.refresh_token = refreshToken;
    await newAdmin.save();
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
    return response_utils_1.default.success(res, "Admin created successfully", admin_mapper_1.AdminMapper.adminResponse(newAdmin));
});
AdminController.login = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
        return next(new core_1.AppError("Missing environment variable", 500));
    }
    const admin = await core_1.Admin.findOne({
        where: { email },
    });
    if (!(admin === null || admin === void 0 ? void 0 : admin.password)) {
        return next(new core_1.AppError("Invalid credential", 404));
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        return next(new core_1.AppError("Incorrect password", 401));
    }
    const accessToken = core_1.AccessToken.sign(admin.id);
    const refreshToken = core_1.RefreshToken.sign(admin.id);
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
    return response_utils_1.default.success(res, "Login successfully", admin_mapper_1.AdminMapper.adminResponse(admin));
});
AdminController.requestAdmin = core_1.CatchAsync.wrap(async (req, res, next) => {
    if (!process.env.JWT_INVITE_ADMIN_SECRET) {
        return next(new core_1.AppError("Missing environment variable", 500));
    }
    const { email } = req.body;
    if (!email) {
        return new core_1.AppError("No email Found", 404);
    }
    const token = core_1.InviteAdminToken.sign(email);
    const data = { token, email };
    await producer_1.PublishToQueue.email("auth.admin.invite", data);
    return response_utils_1.default.success(res, "Request sent successfully!");
});
AdminController.refreshAccessToken = core_1.CatchAsync.wrap(async (req, res) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing Environment variable");
    }
    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;
    const user = await core_1.Admin.findOne({
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
AdminController.logout = core_1.CatchAsync.wrap(async (req, res) => {
    const patientId = req.userId;
    if (patientId) {
        await core_1.Admin.update({ refresh_token: null }, { where: { id: patientId } });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response_utils_1.default.success(res, "Logged out successfully");
});
AdminController.inviteAdmin = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        return next(new core_1.AppError("No invite token provided", 400));
    }
    const payload = core_1.InviteAdminToken.verify(token);
    const existingAdmin = await core_1.Admin.findOne({
        where: { email: payload.email },
    });
    if (existingAdmin) {
        return next(new core_1.AppError("User is already an admin", 400));
    }
    const { firstname, lastname, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await core_1.Admin.create({
        email: payload.email,
        firstname,
        lastname,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return response_utils_1.default.success(res, "Admin created successfully", admin_mapper_1.AdminMapper.adminResponse(newAdmin));
});
AdminController.getAdminById = core_1.CatchAsync.wrap(async (req, res, next) => {
    const userId = req.params.id;
    const admin = await core_1.Admin.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
    });
    if (!admin) {
        return next(new core_1.AppError(`Admin with Id: ${userId} not found`, 404));
    }
    return response_utils_1.default.success(res, `Admin with ID: ${userId}`, admin_mapper_1.AdminMapper.adminResponse(admin));
});
AdminController.getAllAdmins = core_1.CatchAsync.wrap(async (req, res, next) => {
    const allAdmins = await core_1.Admin.findAll({
        attributes: { exclude: ["password"] }
    });
    if (!allAdmins) {
        return next(new core_1.AppError("No Admin seen", 404));
    }
    return response_utils_1.default.success(res, "All Admins", allAdmins);
});
AdminController.deleteAdmin = core_1.CatchAsync.wrap(async (req, res, next) => {
    const adminId = req.params.id;
    const admin = await core_1.Admin.findOne({
        where: { id: adminId },
    });
    if (!admin) {
        return next(new core_1.AppError(`Patient with ID ${adminId} not found`, 404));
    }
    await admin.destroy();
    return response_utils_1.default.success(res, "Admin deleted successfully", admin_mapper_1.AdminMapper.adminResponse(admin));
});
AdminController.forgotPassword = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { email } = req.body;
    const passwordForgetter = await core_1.Admin.findOne({
        where: { email },
    });
    if (!passwordForgetter) {
        return next(new core_1.AppError(`User with Email: ${email} not found`, 404));
    }
    await auth_controller_1.default.forgotPassword(_a.type, email, passwordForgetter.id);
    return response_utils_1.default.success(res, "Link to reset password sent successfully");
});
AdminController.resetPassword = core_1.CatchAsync.wrap(async (req, res, next) => {
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
    const resetUserPassword = await core_1.Admin.update({ password: hashedPassword }, { where: { id: decoded.userId } });
    return response_utils_1.default.success(res, "Password Reset successful", Object.assign({}, resetUserPassword));
});
//# sourceMappingURL=admin.controller.js.map