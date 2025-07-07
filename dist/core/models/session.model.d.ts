import { Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
export declare class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
    id: CreationOptional<string>;
    patient_id: CreationOptional<string>;
    health_practitioner_id: CreationOptional<string>;
    patient_symptoms: string;
    request_session_id: CreationOptional<string>;
    status: string;
    parentId: CreationOptional<string>;
    health_practitioner_report: string;
    diagnosis: string;
    prescription: string;
    rating: number;
}
