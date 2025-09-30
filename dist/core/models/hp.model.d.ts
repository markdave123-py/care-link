import { Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
export declare class HealthPractitioner extends Model<InferAttributes<HealthPractitioner>, InferCreationAttributes<HealthPractitioner>> {
    id: CreationOptional<string>;
    email: string;
    email_verified: boolean;
    is_verified: boolean | null;
    firstname: string;
    lastname: string;
    hp_type_id: string | null;
    password: string | null;
    profile_picture: string | null;
    identification_means: string | null;
    identification_verified: string | null;
    refresh_token: string | null;
    passport: string | null;
    nin: string | null;
    bvn: string | null;
    timezone: string | null;
    idcard: string | null;
    work_identification_number: string | null;
    company_name: string | null;
    company_address: string | null;
    license_number: string | null;
    license_expiry_date: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
