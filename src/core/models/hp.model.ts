import { Model, DataTypes } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/db";

export class HealthPractitioner extends Model<
	InferAttributes<HealthPractitioner>,
	InferCreationAttributes<HealthPractitioner>
> {
	declare id: CreationOptional<string>;
	declare email: string;
	declare email_verified: boolean;
	declare is_verified: boolean | null;
	declare firstname: string;
	declare lastname: string;
	declare hp_type_id: string | null;
	declare password: string | null;
	declare profile_picture: string | null;
	declare identification_means: string | null;
	declare identification_verified: string | null;
	declare refresh_token: string | null;
	declare passport: string | null;
	declare nin: string | null;
	declare bvn: string | null;
	declare available_time: Date[] | null;
	declare idcard: string | null;
	declare work_identification_number: string | null;
	declare company_name: string | null;
	declare company_address: string | null;
	declare license_number: string | null;
	declare license_expiry_date: Date | null;
	declare createdAt: Date;
	declare updatedAt: Date;
}

HealthPractitioner.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		email: DataTypes.STRING,
		email_verified: DataTypes.BOOLEAN,
		is_verified: DataTypes.BOOLEAN,
		firstname: DataTypes.STRING,
		lastname: DataTypes.STRING,
		hp_type_id: { type: DataTypes.UUID, allowNull: true },
		password: DataTypes.TEXT,
		profile_picture: DataTypes.TEXT,
		identification_means: DataTypes.ENUM(
			"PASSPORT", //Added myself
			"NIN",
			"IDCARD",
			"BVN",
			"Driver's License"
		),
		identification_verified: {
			type: DataTypes.BOOLEAN,
		},
		refresh_token: DataTypes.TEXT,
		passport: DataTypes.TEXT,
		nin: DataTypes.STRING,
		bvn: DataTypes.STRING,
		available_time: DataTypes.ARRAY(DataTypes.DATE),
		idcard: DataTypes.TEXT,
		work_identification_number: { type:DataTypes.STRING, unique: true },
		company_name: DataTypes.TEXT,
		company_address: DataTypes.TEXT,
		license_number: DataTypes.STRING, //Added myself
		license_expiry_date: DataTypes.DATE, //Added myself
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		}
	},
	{
		sequelize,
		modelName: "HealthPractitioner",
		timestamps: true,
	}
);
