"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const response_utils_1 = require("../utils/response.utils");
const dotenv_1 = require("dotenv");
const core_2 = require("../../core");
const services_1 = require("../services");
const bcrypt = require("bcrypt");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
class AuthController {
}
_a = AuthController;
AuthController.refreshAccessToken = core_2.CatchAsync.wrap(async (req, res) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing Environment variable");
    }
    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;
    const user = await core_1.Patient.findOne({
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
AuthController.logout = core_2.CatchAsync.wrap(async (req, res) => {
    const patientId = req.userId;
    if (patientId) {
        await core_1.Patient.update({ refresh_token: null }, { where: { id: patientId } });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response_utils_1.default.success(res, null, "Logged out successfully");
});
AuthController.forgotPassword = async (email, userId) => {
    const token = core_1.AccessToken.sign(userId);
    await services_1.ForgotPasswordLink.send(token, email);
};
AuthController.resetPassword = core_2.CatchAsync.wrap(async (req, res, next) => {
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
    const resetPasswordUser = await core_1.Patient.update({ password: hashedPassword }, { where: { id: decoded.userId } });
    return response_utils_1.default.success(res, Object.assign({}, resetPasswordUser), "Password Reset successful");
});
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map