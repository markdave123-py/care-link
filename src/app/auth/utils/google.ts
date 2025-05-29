import type { GoogleOAuthConfig } from "../types/oauth.types";

export const buildUrl = (config: GoogleOAuthConfig, state: string) => {
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
