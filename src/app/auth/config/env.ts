import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` })

export const {
    NODE_ENV,
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL,
    SESSION_SECRET,
    STATE,
} = process.env