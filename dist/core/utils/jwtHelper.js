"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteAdminToken = exports.EmailVerificationToken = exports.RefreshToken = exports.AccessToken = void 0;
const jwt = require("jsonwebtoken");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
class AccessToken {
}
exports.AccessToken = AccessToken;
AccessToken.sign = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};
AccessToken.verify = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.verify(token, process.env.JWT_SECRET);
};
AccessToken.decode = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.decode(token);
};
;
class RefreshToken {
}
exports.RefreshToken = RefreshToken;
RefreshToken.sign = (userId) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET || !process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) {
        throw new Error("Missing environment variable");
    }
    return jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
RefreshToken.verify = (token) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
};
RefreshToken.decode = (token) => {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.decode(token);
};
;
class EmailVerificationToken {
}
exports.EmailVerificationToken = EmailVerificationToken;
EmailVerificationToken.sign = (userId) => {
    if (!process.env.JWT_EMAIL_TOKEN_SECRET || !process.env.JWT_EMAIL_TOKEN_EXPIRES_IN) {
        throw new Error("Missing environment variable");
    }
    return jwt.sign({ userId }, process.env.JWT_EMAIL_TOKEN_SECRET, { expiresIn: "15m" });
};
EmailVerificationToken.verify = (token) => {
    if (!process.env.JWT_EMAIL_TOKEN_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.verify(token, process.env.JWT_EMAIL_TOKEN_SECRET);
};
EmailVerificationToken.decode = (token) => {
    if (!process.env.JWT_EMAIL_TOKEN_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.decode(token);
};
;
class InviteAdminToken {
}
exports.InviteAdminToken = InviteAdminToken;
InviteAdminToken.sign = (email) => {
    if (!process.env.JWT_INVITE_ADMIN_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.sign({ email }, process.env.JWT_INVITE_ADMIN_SECRET, { expiresIn: "15m" });
};
InviteAdminToken.verify = (token) => {
    if (!process.env.JWT_INVITE_ADMIN_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.verify(token, process.env.JWT_INVITE_ADMIN_SECRET);
};
InviteAdminToken.decode = (token) => {
    if (!process.env.JWT_INVITE_ADMIN_SECRET) {
        throw new Error("Missing environment variable");
    }
    return jwt.decode(token);
};
;
//# sourceMappingURL=jwtHelper.js.map