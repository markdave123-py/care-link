import { DataTypes, Model } from "sequelize";
import sequelize from "../../auth/utils/db";

export class HealthPractitioner extends Model {}

HealthPractitioner.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		email: DataTypes.STRING,
        password: DataTypes.TEXT,
		email_verified: DataTypes.BOOLEAN,
		is_verified: DataTypes.BOOLEAN,
		firstname: DataTypes.STRING,
		lastname: DataTypes.STRING,
		passport: DataTypes.TEXT,
		hp_type_id: { type: DataTypes.UUID, allowNull: false },
		profile_picture: DataTypes.TEXT,
		identification_means: DataTypes.ENUM(
			"PASSPORT", //Added myself
			"NIN",
			"IDCARD",
			"BVN",
			"Driver's License"
		),
		identification_number: { type: DataTypes.STRING, unique: true }, // Added myself
		identification_verified: {
			type: DataTypes.BOOLEAN,
		},
		refresh_token: DataTypes.TEXT,
		idcard: DataTypes.TEXT,
		passport_url: DataTypes.TEXT, // Added myself
		nin: DataTypes.STRING,
		bvn: DataTypes.STRING,
		license_number: DataTypes.STRING, //Added myself
		license_expiry_date: DataTypes.DATE, //Added myself
		available_time: DataTypes.ARRAY(DataTypes.DATE),
		work_identification_number: DataTypes.STRING,
		company_name: DataTypes.TEXT,
		company_address: DataTypes.TEXT,
	},
	{
		sequelize,
		modelName: "HealthPractitioner",
		timestamps: true,
	}
);
