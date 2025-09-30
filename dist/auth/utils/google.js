"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUrl = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
const buildUrl = (config) => {
    const state = process.env.STATE || "some-state";
    const authUrl = new URL(config.authorization_url);
    authUrl.searchParams.append("client_id", config.client_id);
    authUrl.searchParams.append("redirect_uri", config.redirect_uri);
    authUrl.searchParams.append("scope", config.scope);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
    return authUrl.toString();
};
exports.buildUrl = buildUrl;
//# sourceMappingURL=google.js.map