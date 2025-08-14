import { Model, DataTypes } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/db";

export class Session extends Model<
	InferAttributes<Session>,
	InferCreationAttributes<Session>
> {
    declare id: CreationOptional<string>;
    declare patient_id: CreationOptional<string>;
    declare health_practitioner_id: CreationOptional<string>;
    declare patient_symptoms: string;
    declare request_session_id: CreationOptional<string>;
    declare status: string;
    declare parentId: CreationOptional<string>;
    declare health_practitioner_report: string;
    declare diagnosis: string;
    declare prescription: string;
    declare rating: number;
    declare time: CreationOptional<Date>;
    // declare start_time: CreationOptional<Date>;
    // declare end_time: CreationOptional<Date>;
}

Session.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        patient_id: {
            type: DataTypes.UUID,
        },
        health_practitioner_id: {
            type: DataTypes.UUID,
        },
        patient_symptoms: {
            type: DataTypes.TEXT,
        },
        request_session_id: {
            type: DataTypes.UUID,
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'completed', 'inprogress', 'havefollowup'), //samuel made changes here because the default value was inprogress and it wasn't correct kind of
            defaultValue: 'scheduled',
        },
        parentId: {
            type: DataTypes.UUID,
        },
        health_practitioner_report: {
            type: DataTypes.TEXT,
        },
        diagnosis: {
            type: DataTypes.TEXT,
        },
        prescription: {
            type: DataTypes.TEXT,
        },
        rating: {
            type: DataTypes.INTEGER,
        },
        time : DataTypes.DATE,
        // start_time : DataTypes.DATE,
        // end_time : DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Session",
        timestamps: true
    }
)