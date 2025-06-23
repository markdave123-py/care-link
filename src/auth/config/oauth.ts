import { config } from "dotenv";
import type { GoogleOAuthConfig } from "../types/oauth.types";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_HP_REDIRECT_URI, GOOGLE_PATIENT_REDIRECT_URI } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_HP_REDIRECT_URI || !GOOGLE_PATIENT_REDIRECT_URI) {
  throw new Error("Missing Google OAuth environment variables");
}

export const googlePatient: GoogleOAuthConfig = {
  client_id: GOOGLE_CLIENT_ID,
  client_secret: GOOGLE_CLIENT_SECRET,
  redirect_uri: GOOGLE_PATIENT_REDIRECT_URI,
  scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  authorization_url: "https://accounts.google.com/o/oauth2/v2/auth",
  token_url: "https://oauth2.googleapis.com/token",
  userinfo_url: "https://www.googleapis.com/oauth2/v2/userinfo",
};


export const googleHp: GoogleOAuthConfig = {
    client_id: GOOGLE_CLIENT_ID || "your-client-id",
    client_secret: GOOGLE_CLIENT_SECRET || "your-client-secret",
    redirect_uri: GOOGLE_HP_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/google/callback',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_url: 'https://oauth2.googleapis.com/token',
    userinfo_url: 'https://www.googleapis.com/oauth2/v2/userinfo'
}