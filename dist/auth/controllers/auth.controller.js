"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const response_utils_1 = require("../utils/response.utils");
const dotenv_1 = require("dotenv");
const bcrypt = require("bcrypt");
const producer_1 = require("../../common/rabbitmq/producer");
const utils_1 = require("../../core/utils");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
class AuthController {
}
_a = AuthController;
AuthController.refreshAccessToken = utils_1.CatchAsync.wrap(async (req, res) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing Environment variable");
    }
    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;
    const user = await core_1.Patient.findOne({
        where: { id: userId },
    });
    if (!user || !refreshToken) {
        return response_utils_1.default.unauthorized(res, "Request Token not found", null);
    }
    if (user.refresh_token !== refreshToken) {
        return response_utils_1.default.unauthorized(res, "Invalid refresh token", null);
    }
    const accessToken = core_1.AccessToken.sign(userId);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        sameSite: "strict",
    });
    return response_utils_1.default.success(res, "Access Token refreshed successfully", null);
});
AuthController.logout = utils_1.CatchAsync.wrap(async (req, res) => {
    const patientId = req.userId;
    if (patientId) {
        await core_1.Patient.update({ refresh_token: null }, { where: { id: patientId } });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response_utils_1.default.success(res, "Logged out successfully", null);
});
AuthController.forgotPassword = async (type, email, userId) => {
    const token = core_1.AccessToken.sign(userId);
    const data = { token, email, type };
    const key = "auth.patient.forgotpassword";
    await producer_1.PublishToQueue.email(key, data);
};
AuthController.resetPassword = utils_1.CatchAsync.wrap(async (req, res, next) => {
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
    return response_utils_1.default.success(res, "Password Reset successful", Object.assign({}, resetPasswordUser));
});
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map