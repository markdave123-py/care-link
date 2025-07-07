"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HPType = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class HPType extends sequelize_1.Model {
}
exports.HPType = HPType;
HPType.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    name: sequelize_1.DataTypes.STRING,
    embedding: {
        type: 'vector(768)',
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'HPType',
});
//# sourceMappingURL=hptype.model.js.map