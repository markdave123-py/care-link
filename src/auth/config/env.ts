import { config } from "dotenv";

config()

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` })

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing requirement environment variable: ${key}`);
    }
    return value
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: requireEnv('GOOGLE_CLIENT_SECRET'),
    GOOGLE_HP_REDIRECT_URI: requireEnv('GOOGLE_HP_REDIRECT_URI'),
    GOOGLE_TOKEN_INFO_URL: requireEnv('GOOGLE_TOKEN_INFO_URL'),
    SESSION_SECRET: requireEnv('SESSION_SECRET'),
    STATE: requireEnv('STATE'),
    JWT_SECRET: requireEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: requireEnv('JWT_EXPIRES_IN'),
    JWT_REFRESH_TOKEN_SECRET: requireEnv('JWT_REFRESH_TOKEN_SECRET'),
    JWT_REFRESH_TOKEN_EXPIRES_IN: requireEnv('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    POSTGRES_URI: requireEnv('POSTGRES_URI'),
    OPENAI_APIKEY: requireEnv('OPENAI_APIKEY'),
    OPENAI_MODEL: requireEnv('OPENAI_MODEL'),
    AWS_REGION: requireEnv('AWS_REGION'),
    AWS_S3_BUCKET: requireEnv('AWS_S3_BUCKET'),
    AWS_ACCESS_KEY_ID: requireEnv('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: requireEnv('AWS_SECRET_ACCESS_KEY'),
    RABBITMQ_URL: requireEnv('RABBITMQ_URL'),
    SLOT_LENGTH_MINUTES: requireEnv('SLOT_LENGTH_MINUTES'),
    CORS_OPTIONS: requireEnv('CORS_OPTIONS'),
    API_BASE_URL: requireEnv('API_BASE_URL'),
    PORT: requireEnv('PORT')
} as const;

export function getSlotLen(): number{
    const slotlen = parseInt(env.SLOT_LENGTH_MINUTES, 10)

    if (Number.isNaN(slotlen) || slotlen <= 0){
        return 30
    }
    return slotlen
}