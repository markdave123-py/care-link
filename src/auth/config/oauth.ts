import { config } from "dotenv";
import type { GoogleOAuthConfig } from "../types/oauth.types";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_HP_REDIRECT_URI,
  GOOGLE_PATIENT_REDIRECT_URI, GOOGLE_SCOPE, GOOGLE_AUTHORIZATION_URL,
  GOOGLE_TOKEN_ENDPOINT, GOOGLE_USERINFO } = process.env;

// if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_HP_REDIRECT_URI ||
//   !GOOGLE_PATIENT_REDIRECT_URI || !GOOGLE_SCOPE || !GOOGLE_AUTHORIZATION_URL
//   || !GOOGLE_TOKEN_ENDPOINT || !GOOGLE_USERINFO) {
//   throw new Error("Missing Google OAuth environment variables");
// }

export const googlePatient: GoogleOAuthConfig = {
  client_id: GOOGLE_CLIENT_ID!,
  client_secret: GOOGLE_CLIENT_SECRET!,
  redirect_uri: GOOGLE_PATIENT_REDIRECT_URI!,
  scope: GOOGLE_SCOPE!,
  authorization_url: GOOGLE_AUTHORIZATION_URL!,
  token_url: GOOGLE_TOKEN_ENDPOINT!,
  userinfo_url: GOOGLE_USERINFO!,
};


export const googleHp: GoogleOAuthConfig = {
    client_id: GOOGLE_CLIENT_ID!,
    client_secret: GOOGLE_CLIENT_SECRET!,
    redirect_uri: GOOGLE_HP_REDIRECT_URI!,
    scope: GOOGLE_SCOPE!,
    authorization_url: GOOGLE_AUTHORIZATION_URL!,
    token_url: GOOGLE_TOKEN_ENDPOINT!,
    userinfo_url: GOOGLE_USERINFO!
}