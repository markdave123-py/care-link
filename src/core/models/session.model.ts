import { DataTypes, Model } from "sequelize";
import sequelize from "src/auth/utils/db";

export class Session extends Model {
    declare id: number;
    declare patient_id: number;
    declare health_practitioner_id: number;
    declare patient_symptoms: string;
    declare request_session_id: string;
    declare status: string; // Change back to enum
    declare parentId: number;
    declare health_practitioner_report: string;
    declare diagnosis: string;
    declare prescription: string;
    declare rating: number;
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
        request_session_id: {
            type: DataTypes.UUID,
        },
        status: {
            type: DataTypes.ENUM('completed', 'inprogress', 'havefollowup'),
            defaultValue: 'inprogress',
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
        rating: {
            type: DataTypes.NUMBER,
        },
    },
    {
        sequelize,
        modelName: "Session",
        timestamps: true
    }
)