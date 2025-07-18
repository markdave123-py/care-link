import * as jwt from "jsonwebtoken";
export declare class AccessToken {
    static sign: (userId: string) => string;
    static verify: (token: string) => {
        userId: string;
    };
    static decode: (token: string) => string | jwt.JwtPayload | null;
}
export declare class RefreshToken {
    static sign: (userId: string) => string;
    static verify: (token: string) => string | jwt.JwtPayload;
    static decode: (token: string) => string | jwt.JwtPayload | null;
}
export declare class EmailVerificationToken {
    static sign: (userId: string) => string;
    static verify: (token: string) => string | jwt.JwtPayload;
    static decode: (token: string) => string | jwt.JwtPayload | null;
}
export declare class InviteAdminToken {
    static sign: (email: string) => string;
    static verify: (token: string) => {
        email: string;
    };
    static decode: (token: string) => string | jwt.JwtPayload | null;
}
