import type {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
} from "sequelize";
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class Patient extends Model<
	InferAttributes<Patient>,
	InferCreationAttributes<Patient>
> {
	declare id: CreationOptional<string>;
	declare email: string;
	declare email_verified: boolean;
	declare firstname: string;
	declare lastname: string;
	declare password: string;
	declare profile_picture: string | null;
	declare refresh_token: string | null;
	declare createdAt: Date;
	declare updatedAt: Date;
}

Patient.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		email_verified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		firstname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		profile_picture: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		refresh_token: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		modelName: "Patient",
		timestamps: true,
	}
);
