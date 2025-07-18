"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientMapper = void 0;
class PatientMapper {
}
exports.PatientMapper = PatientMapper;
PatientMapper.patientResponse = (patient) => {
    return {
        id: patient.id,
        firstname: patient.firstname,
        lastname: patient.lastname,
        refreshToken: patient.refresh_token,
        email: patient.email
    };
};
//# sourceMappingURL=patient.mapper.js.map