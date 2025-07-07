"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const response_utils_1 = require("../utils/response.utils");
const dotenv_1 = require("dotenv");
const core_1 = require("../../core");
const core_2 = require("../../core");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
class AuthMiddleware {
}
_a = AuthMiddleware;
AuthMiddleware.authenticateUser = core_1.CatchAsync.wrap(async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!process.env.JWT_SECRET) {
        return next(new core_2.AppError("Missing environment variable", 500));
    }
    if (!token) {
        return response_utils_1.default.unauthorized(res, null);
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;
    next();
});
AuthMiddleware.authenticateAdmin = core_1.CatchAsync.wrap(async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!process.env.JWT_SECRET) {
        return next(new core_2.AppError("Missing environment variable", 500));
    }
    if (!token) {
        return response_utils_1.default.unauthorized(res, null);
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
    const userId = decodedToken.userId;
    const admin = await core_1.Admin.findOne({
        where: { id: userId }
    });
    if (!admin) {
        return next(new core_2.AppError("You are not an admin", 401));
    }
    next();
});
AuthMiddleware.refreshTokenValidation = core_1.CatchAsync.wrap(async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        return next(new core_2.AppError("Missing environment variable", 500));
    }
    if (!token) {
        return response_utils_1.default.unauthorized(res, { message: "No refresh token provided" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
    req.userId = decodedToken.userId;
    next();
});
AuthMiddleware.verifyUserEmail = core_1.CatchAsync.wrap(async (req, res, next) => {
    const token = req.query.token;
    if (!token) {
        return next(new core_2.AppError("Missing token from URL", 500));
    }
    const decodedToken = core_1.EmailVerificationToken.verify(token);
    req.userId = decodedToken.userId;
    next();
});
exports.default = AuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map