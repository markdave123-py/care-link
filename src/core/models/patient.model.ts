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
	declare password: string | null;
	declare profile_picture: string | null;
	// declare phone_number: string | null;
	// declare date_of_birth: Date | null;
	// declare address: string | null;
	// declare allergies: string | null;
	// declare emergency_contact: string | null;
	// declare bio: string | null;
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
			allowNull: true,
		},
		profile_picture: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		// phone_number: {
		// 	type: DataTypes.STRING,
		// 	allowNull: true,
		// },
		// date_of_birth: {
		// 	type: DataTypes.DATE,
		// 	allowNull: true,
		// },
		// address: {
		// 	type: DataTypes.STRING,
		// 	allowNull: true,
		// },
		// allergies: {
		// 	type: DataTypes.STRING,
		// 	allowNull: true,
		// },
		// emergency_contact: {
		// 	type: DataTypes.STRING,
		// 	allowNull: true,
		// },
		// bio: {
		// 	type: DataTypes.STRING,
		// 	allowNull: true,
		// },
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
