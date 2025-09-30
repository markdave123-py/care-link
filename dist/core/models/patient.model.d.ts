import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Model } from "sequelize";
export declare class Patient extends Model<InferAttributes<Patient>, InferCreationAttributes<Patient>> {
    id: CreationOptional<string>;
    email: string;
    email_verified: boolean;
    firstname: string;
    lastname: string;
    password: string | null;
    profile_picture: string | null;
    refresh_token: string | null;
    createdAt: Date;
    updatedAt: Date;
}
