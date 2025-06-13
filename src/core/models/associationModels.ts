import { Patient } from './patient.model';
import { HealthPractitioner } from './hp.model';
import { Session } from './session.model';
import { RequestSession } from './request_session.model';
import { HPType } from './hptype.model';

export const associateModels = () => {
  // Patient
  Patient.hasMany(Session, { foreignKey: 'patient_id' });
  Patient.hasMany(RequestSession, { foreignKey: 'patient_id' });

  // Health Practitioner
  HealthPractitioner.hasMany(Session, { foreignKey: 'health_practitioner_id' });
  HealthPractitioner.hasMany(RequestSession, { foreignKey: 'health_practitioner_id' });
  HealthPractitioner.belongsTo(HPType, { foreignKey: 'hp_type_id' });

  // Sessions
  Session.belongsTo(Patient, { foreignKey: 'patient_id' });
  Session.belongsTo(HealthPractitioner, { foreignKey: 'health_practitioner_id' });

  // Request Sessions
  RequestSession.belongsTo(Patient, { foreignKey: 'patient_id' });
  RequestSession.belongsTo(HealthPractitioner, { foreignKey: 'health_practitioner_id' });

  // HP Type
  HPType.hasMany(HealthPractitioner, { foreignKey: 'hp_type_id' });
};
