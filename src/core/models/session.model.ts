import { DataTypes, Model } from "sequelize";
import sequelize from "../../auth/utils/db";

export class Session extends Model {}

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
        precription: {
            type: DataTypes.TEXT,
        },
        rating: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: "Session",
        timestamps: true
    }
)