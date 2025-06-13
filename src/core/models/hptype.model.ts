import { DataTypes, Model } from 'sequelize';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/db';

export class HPType extends Model<
	InferAttributes<HPType>,
	InferCreationAttributes<HPType>
> {
    declare id: CreationOptional<string>;
    declare name: string;
}

HPType.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: DataTypes.STRING,
    },
    {
    sequelize,
    modelName: 'HPType',
    }
);