"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAdmin = exports.googleHp = exports.googlePatient = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_HP_REDIRECT_URI, GOOGLE_PATIENT_REDIRECT_URI, GOOGLE_ADMIN_REDIRECT_URI, GOOGLE_SCOPE, GOOGLE_AUTHORIZATION_URL, GOOGLE_TOKEN_ENDPOINT, GOOGLE_USERINFO } = process.env;
exports.googlePatient = {
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_PATIENT_REDIRECT_URI,
    scope: GOOGLE_SCOPE,
    authorization_url: GOOGLE_AUTHORIZATION_URL,
    token_url: GOOGLE_TOKEN_ENDPOINT,
    userinfo_url: GOOGLE_USERINFO,
};
exports.googleHp = {
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_HP_REDIRECT_URI,
    scope: GOOGLE_SCOPE,
    authorization_url: GOOGLE_AUTHORIZATION_URL,
    token_url: GOOGLE_TOKEN_ENDPOINT,
    userinfo_url: GOOGLE_USERINFO
};
exports.googleAdmin = {
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_ADMIN_REDIRECT_URI,
    scope: GOOGLE_SCOPE,
    authorization_url: GOOGLE_AUTHORIZATION_URL,
    token_url: GOOGLE_TOKEN_ENDPOINT,
    userinfo_url: GOOGLE_USERINFO
};
//# sourceMappingURL=oauth.js.map