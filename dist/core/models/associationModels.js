"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.associateModels = void 0;
const patient_model_1 = require("./patient.model");
const hp_model_1 = require("./hp.model");
const session_model_1 = require("./session.model");
const request_session_model_1 = require("./request_session.model");
const hptype_model_1 = require("./hptype.model");
const associateModels = () => {
    patient_model_1.Patient.hasMany(session_model_1.Session, { foreignKey: 'patient_id' });
    patient_model_1.Patient.hasMany(request_session_model_1.RequestSession, { foreignKey: 'patient_id' });
    hp_model_1.HealthPractitioner.hasMany(session_model_1.Session, { foreignKey: 'health_practitioner_id' });
    hp_model_1.HealthPractitioner.hasMany(request_session_model_1.RequestSession, { foreignKey: 'health_practitioner_id' });
    hp_model_1.HealthPractitioner.belongsTo(hptype_model_1.HPType, { foreignKey: 'hp_type_id' });
    session_model_1.Session.belongsTo(patient_model_1.Patient, { foreignKey: 'patient_id' });
    session_model_1.Session.belongsTo(hp_model_1.HealthPractitioner, { foreignKey: 'health_practitioner_id' });
    request_session_model_1.RequestSession.belongsTo(patient_model_1.Patient, { foreignKey: 'patient_id' });
    request_session_model_1.RequestSession.belongsTo(hp_model_1.HealthPractitioner, { foreignKey: 'health_practitioner_id' });
    hptype_model_1.HPType.hasMany(hp_model_1.HealthPractitioner, { foreignKey: 'hp_type_id' });
};
exports.associateModels = associateModels;
//# sourceMappingURL=associationModels.js.map