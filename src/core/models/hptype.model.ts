import { DataTypes, Model } from 'sequelize';
import sequelize from '../../auth/utils/db';

export class HPType extends Model {}

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