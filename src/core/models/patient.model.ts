import { DataTypes, Model } from "sequelize";
import sequelize from "../../auth/utils/db";

export class Patient extends Model {}

Patient.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profile_picture: {
            type: DataTypes.TEXT,
            allowNull: true

        },
        refresh_token: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    },
    {
        sequelize,
        modelName: "User",
        timestamps: true,
    }
)