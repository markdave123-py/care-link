import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/db";

export class Admin extends Model<
	InferAttributes<Admin>,
	InferCreationAttributes<Admin>
> {
	declare id: CreationOptional<string>;
	declare email: string;
	declare firstname: string;
	declare lastname: string;
	declare password: string;
	declare refresh_token: string | null;
}

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
		refresh_token: DataTypes.STRING,
	},
	{
		sequelize,
		modelName: "Admin",
        timestamps: true,
	}
);
