"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Session extends sequelize_1.Model {
}
exports.Session = Session;
Session.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    patient_id: {
        type: sequelize_1.DataTypes.UUID,
    },
    health_practitioner_id: {
        type: sequelize_1.DataTypes.UUID,
    },
    patient_symptoms: {
        type: sequelize_1.DataTypes.TEXT,
    },
    request_session_id: {
        type: sequelize_1.DataTypes.UUID,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('scheduled', 'completed', 'inprogress', 'havefollowup'),
        defaultValue: 'scheduled',
    },
    parentId: {
        type: sequelize_1.DataTypes.UUID,
    },
    health_practitioner_report: {
        type: sequelize_1.DataTypes.TEXT,
    },
    diagnosis: {
        type: sequelize_1.DataTypes.TEXT,
    },
    prescription: {
        type: sequelize_1.DataTypes.TEXT,
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    time: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.default,
    modelName: "Session",
    timestamps: true
});
//# sourceMappingURL=session.model.js.map