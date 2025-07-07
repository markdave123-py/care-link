import { Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
export declare class Admin extends Model<InferAttributes<Admin>, InferCreationAttributes<Admin>> {
    id: CreationOptional<string>;
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    refresh_token: string | null;
}
