export interface GoogleOAuthConfig {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    scope: string;
    authorization_url: string;
    token_url: string;
    userinfo_url: string;
}
export interface GoogleTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
}
export interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}
export interface AuthSession {
    user?: GoogleUserInfo;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: number;
    oauth_state?: string;
}
