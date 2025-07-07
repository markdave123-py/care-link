import { DataTypes, Model } from 'sequelize';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/db';

export class HPType extends Model<
	InferAttributes<HPType>,
	InferCreationAttributes<HPType>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare embedding: number[] | null;
}

HPType.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: DataTypes.STRING,
        embedding: {
            type: DataTypes.ARRAY(DataTypes.FLOAT),
            // type: 'vector(768)' as unknown as DataTypes.AbstractDataType,
            allowNull: true,
          },
    },
    {
    sequelize,
    modelName: 'HPType',
    }
);