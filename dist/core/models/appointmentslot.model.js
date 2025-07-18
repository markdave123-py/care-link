"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentSlot = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class AppointmentSlot extends sequelize_1.Model {
}
exports.AppointmentSlot = AppointmentSlot;
AppointmentSlot.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    hp_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    patient_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    request_session_id: sequelize_1.DataTypes.UUID,
    session_id: sequelize_1.DataTypes.UUID,
    start_ts: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    end_ts: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
        defaultValue: 'pending',
    },
}, {
    sequelize: db_1.default,
    modelName: 'AppointmentSlot',
    indexes: [
        { fields: ['hp_id', 'start_ts'] },
    ],
});
//# sourceMappingURL=appointmentslot.model.js.map