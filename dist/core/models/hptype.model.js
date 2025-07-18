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
        type: 'vector(384)',
        allowNull: true,
        set(val) {
            if (val === null) {
                this.setDataValue('embedding', null);
            }
            else {
                this.setDataValue('embedding', `[${val.join(',')}]`);
            }
        },
        get() {
            const raw = this.getDataValue('embedding');
            return raw ? raw.slice(1, -1).split(',').map(Number) : null;
        }
    },
}, {
    sequelize: db_1.default,
    modelName: 'HPType',
});
//# sourceMappingURL=hptype.model.js.map