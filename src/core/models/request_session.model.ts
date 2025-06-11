import { DataTypes, Model } from "sequelize";
import sequelize from "../../auth/utils/db";

export class RequestSession extends Model {}

RequestSession.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		patient_id: DataTypes.UUID,
		health_practitioner_id: DataTypes.UUID,
		status: DataTypes.ENUM("pending", "accepted", "rejected", "cancelled"),
		patient_symptoms: DataTypes.TEXT,
		ongoing_medication: DataTypes.TEXT,
	},
	{
		sequelize,
		modelName: "RequestSession",
		timestamps: true,
	}
);
