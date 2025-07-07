"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const core_1 = require("../../core");
const bcrypt = require("bcrypt");
const response_utils_1 = require("../utils/response.utils");
const adminInvite_service_1 = require("../services/adminInvite.service");
const admin_mapper_1 = require("../mappers/admin.mapper");
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
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
    return response_utils_1.default.success(res, admin_mapper_1.AdminMapper.adminResponse(newAdmin), "Admin created successfully");
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
    return response_utils_1.default.success(res, admin_mapper_1.AdminMapper.adminResponse(admin));
});
AdminController.requestAdmin = core_1.CatchAsync.wrap(async (req, res, next) => {
    if (!process.env.JWT_INVITE_ADMIN_SECRET) {
        return next(new core_1.AppError("Missing environment variable", 500));
    }
    const { email } = req.body;
    const token = core_1.InviteAdminToken.sign(email);
    await adminInvite_service_1.AdminInviteLink.send(email, token);
    res.json("Request sent successfully!");
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
AdminController.logout = core_1.CatchAsync.wrap(async (req, res) => {
    const patientId = req.userId;
    if (patientId) {
        await core_1.Admin.update({ refresh_token: null }, { where: { id: patientId } });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response_utils_1.default.success(res, null, "Logged out successfully");
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
    });
    return response_utils_1.default.success(res, admin_mapper_1.AdminMapper.adminResponse(newAdmin), "Admin created successfully");
});
//# sourceMappingURL=admin.controller.js.map