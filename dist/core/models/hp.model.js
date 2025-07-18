"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthPractitioner = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class HealthPractitioner extends sequelize_1.Model {
}
exports.HealthPractitioner = HealthPractitioner;
HealthPractitioner.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    email: sequelize_1.DataTypes.STRING,
    email_verified: sequelize_1.DataTypes.BOOLEAN,
    is_verified: sequelize_1.DataTypes.BOOLEAN,
    firstname: sequelize_1.DataTypes.STRING,
    lastname: sequelize_1.DataTypes.STRING,
    hp_type_id: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    password: sequelize_1.DataTypes.TEXT,
    profile_picture: sequelize_1.DataTypes.TEXT,
    identification_means: sequelize_1.DataTypes.ENUM("PASSPORT", "NIN", "IDCARD", "BVN", "Driver's License"),
    identification_verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
    },
    refresh_token: sequelize_1.DataTypes.TEXT,
    passport: sequelize_1.DataTypes.TEXT,
    nin: sequelize_1.DataTypes.STRING,
    bvn: sequelize_1.DataTypes.STRING,
    available_time: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.DATE),
    idcard: sequelize_1.DataTypes.TEXT,
    work_identification_number: { type: sequelize_1.DataTypes.STRING, unique: true },
    company_name: sequelize_1.DataTypes.TEXT,
    company_address: sequelize_1.DataTypes.TEXT,
    license_number: sequelize_1.DataTypes.STRING,
    license_expiry_date: sequelize_1.DataTypes.DATE,
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    }
}, {
    sequelize: db_1.default,
    modelName: "HealthPractitioner",
    timestamps: true,
});
//# sourceMappingURL=hp.model.js.map