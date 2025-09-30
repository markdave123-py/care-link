import { Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
export declare class Admin extends Model<InferAttributes<Admin>, InferCreationAttributes<Admin>> {
    id: CreationOptional<string>;
    email: string;
    firstname: string;
    lastname: string;
    password: string | null;
    refresh_token: string | null;
    createdAt: Date;
    updatedAt: Date;
}
