import { DataTypes, Model } from "sequelize";
import sequelize from "src/auth/utils/db";

export class Patient extends Model {
    declare id: string;
    declare email: string;
    declare email_verified: boolean;
    declare firstname: string;
    declare lastname: string;
    declare password: string;
    declare profile_picture: string;
    declare refresh_token: string;
}

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