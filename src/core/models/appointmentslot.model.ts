import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

export class AppointmentSlot extends Model {
  declare id: string;
  declare hp_id: string;
  declare patient_id: string;
  declare request_session_id: string | null;
  declare session_id: string | null;
  declare start_ts: Date;
  declare end_ts: Date;        // always start_ts + duration
  declare status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

AppointmentSlot.init(
  {
    id:       { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    hp_id:    { type: DataTypes.UUID, allowNull: false },
    patient_id: { type: DataTypes.UUID, allowNull: false },
    request_session_id: DataTypes.UUID,
    session_id: DataTypes.UUID,
    start_ts: { type: DataTypes.DATE, allowNull: false },
    end_ts:   { type: DataTypes.DATE, allowNull: false },
    status:   {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'AppointmentSlot',
    indexes: [
      { fields: ['hp_id', 'start_ts'] }, // for faster lookups
    ],
  }
);
