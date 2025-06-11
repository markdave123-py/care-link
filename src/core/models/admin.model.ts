import { DataTypes, Model } from "sequelize";
import sequelize from "../../auth/utils/db";

export class Admin extends Model {}

Admin.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		email: DataTypes.STRING,
		firstname: DataTypes.STRING,
		lastname: DataTypes.STRING,
		password: DataTypes.TEXT,
	},
	{
		sequelize,
		modelName: "Admin",
        timestamps: true,
	}
);
