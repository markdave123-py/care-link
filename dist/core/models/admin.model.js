"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Admin extends sequelize_1.Model {
}
exports.Admin = Admin;
Admin.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: sequelize_1.DataTypes.STRING,
    firstname: sequelize_1.DataTypes.STRING,
    lastname: sequelize_1.DataTypes.STRING,
    password: sequelize_1.DataTypes.TEXT,
    refresh_token: sequelize_1.DataTypes.STRING,
}, {
    sequelize: db_1.default,
    modelName: "Admin",
    timestamps: true,
});
//# sourceMappingURL=admin.model.js.map