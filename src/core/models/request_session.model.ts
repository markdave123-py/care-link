import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../config/db";

export class RequestSession extends Model<
	InferAttributes<RequestSession>,
	InferCreationAttributes<RequestSession>
> {
	declare id: CreationOptional<string>;
	declare patient_id: CreationOptional<string>;
	declare health_practitioner_id: CreationOptional<string>;
	declare status: CreationOptional<string>;
	declare patient_symptoms: string;
	declare ongoing_medication: string;
	// declare time: Date;
	declare start_time: CreationOptional<Date>;
    declare end_time: CreationOptional<Date>;
}

RequestSession.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		patient_id: DataTypes.UUID,
		health_practitioner_id: DataTypes.UUID,
		status: {
			type: DataTypes.ENUM("pending", "accepted", "rejected", "cancelled"),
			defaultValue: "pending",
		},
		patient_symptoms: DataTypes.TEXT,
		// time : DataTypes.DATE,
		start_time : DataTypes.DATE,
        end_time : DataTypes.DATE,
		ongoing_medication: DataTypes.TEXT,
	},
	{
		sequelize,
		modelName: "RequestSession",
		timestamps: true,
	}
);
