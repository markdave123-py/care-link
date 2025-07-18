"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingHour = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class WorkingHour extends sequelize_1.Model {
}
exports.WorkingHour = WorkingHour;
WorkingHour.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    hp_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    dow: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
    starts: { type: sequelize_1.DataTypes.TIME, allowNull: false },
    ends: { type: sequelize_1.DataTypes.TIME, allowNull: false },
}, {
    sequelize: db_1.default,
    modelName: 'WorkingHour',
    indexes: [
        { unique: true, fields: ['hp_id', 'dow', 'starts'] },
    ],
});
//# sourceMappingURL=workinghour.model.js.map