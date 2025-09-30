import { Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
export declare class RequestSession extends Model<InferAttributes<RequestSession>, InferCreationAttributes<RequestSession>> {
    id: CreationOptional<string>;
    patient_id: CreationOptional<string>;
    health_practitioner_id: CreationOptional<string>;
    status: CreationOptional<string>;
    patient_symptoms: string;
    ongoing_medication: string;
    start_time: CreationOptional<Date>;
    end_time: CreationOptional<Date>;
}
