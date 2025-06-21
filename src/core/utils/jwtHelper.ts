import * as jwt from "jsonwebtoken";
import { config } from "dotenv"; 

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local`})

export class AccessToken {
    static sign = (userId: string) => {
        if (!process.env.JWT_SECRET) {
            throw new Error("Missing environment variable")
        }
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        )
    }

    static verify = (token: string): { userId: string } => {
        if (!process.env.JWT_SECRET) {
            throw new Error("Missing environment variable")
        }
        return jwt.verify(
            token,
            process.env.JWT_SECRET,
        ) as { userId: string }
    }

    static decode = (token: string) => {
        if (!process.env.JWT_SECRET) {
            throw new Error("Missing environment variable")
        }
        return jwt.decode(
            token
        )
    }
};

export class RefreshToken {
    static sign = (userId: string) => {
        if (!process.env.JWT_REFRESH_TOKEN_SECRET || !process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) {
            throw new Error("Missing environment variable")
        }
        return jwt.sign(
            { userId },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        )
    }

    static verify = (token: string) => {
        if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
            throw new Error("Missing environment variable")
        }
        return jwt.verify(
            token,
            process.env.JWT_REFRESH_TOKEN_SECRET,
        )
    }

    static decode = (token: string) => {
        if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
            throw new Error("Missing environment variable")
        }
        return jwt.decode(
            token
        )
    }
};

export class EmailVerificationToken {
    static sign = (userId: string) => {
        if (!process.env.JWT_EMAIL_TOKEN_SECRET || !process.env.JWT_EMAIL_TOKEN_EXPIRES_IN) {
            throw new Error("Missing environment variable")
        }
        return jwt.sign(
            { userId },
            process.env.JWT_EMAIL_TOKEN_SECRET,
            { expiresIn: "7d" }
        )
    }

    static verify = (token: string) => {
        if (!process.env.JWT_EMAIL_TOKEN_SECRET) {
            throw new Error("Missing environment variable")
        }
        return jwt.verify(
            token,
            process.env.JWT_EMAIL_TOKEN_SECRET,
        )
    }

    static decode = (token: string) => {
        if (!process.env.JWT_EMAIL_TOKEN_SECRET) {
            throw new Error("Missing environment variable")
        }
        return jwt.decode(
            token
        )
    }
};
