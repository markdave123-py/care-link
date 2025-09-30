"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestSession = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class RequestSession extends sequelize_1.Model {
}
exports.RequestSession = RequestSession;
RequestSession.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    patient_id: sequelize_1.DataTypes.UUID,
    health_practitioner_id: sequelize_1.DataTypes.UUID,
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "accepted", "rejected", "cancelled"),
        defaultValue: "pending",
    },
    patient_symptoms: sequelize_1.DataTypes.TEXT,
    start_time: sequelize_1.DataTypes.DATE,
    end_time: sequelize_1.DataTypes.DATE,
    ongoing_medication: sequelize_1.DataTypes.TEXT,
}, {
    sequelize: db_1.default,
    modelName: "RequestSession",
    timestamps: true,
});
//# sourceMappingURL=request_session.model.js.map