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
            type: 'vector(384)' as unknown as DataTypes.AbstractDataType,
            allowNull: true,
            set(val: number[] | null) {
                if (val === null) {
                  this.setDataValue('embedding', null);
                } else {
                  this.setDataValue('embedding', `[${val.join(',')}]` as unknown as any);
                }
              },
              get() {
                const raw = this.getDataValue('embedding') as string | null;
                return raw ? raw.slice(1, -1).split(',').map(Number) : null;
              }
          },
    },
    {
    sequelize,
    modelName: 'HPType',
    }
);