import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

export class WorkingHour extends Model {
  declare id: string;
  declare hp_id: string;
  declare dow: number;          // 0 = Mon, 6 = Sun
  declare starts: string;       // '09:00'
  declare ends:   string;       // '17:00'
}

WorkingHour.init(
  {
    id:       { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    hp_id:    { type: DataTypes.UUID, allowNull: false },
    dow:      { type: DataTypes.SMALLINT, allowNull: false },
    starts:   { type: DataTypes.TIME, allowNull: false },
    ends:     { type: DataTypes.TIME, allowNull: false },
  },
  {
    sequelize,
    modelName: 'WorkingHour',
    indexes: [
      { unique: true, fields: ['hp_id', 'dow', 'starts'] }, // no duplicates
    ],
  }
);
