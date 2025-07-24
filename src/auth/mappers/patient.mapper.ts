import type { Patient } from "../../core";

type PatientResponse = {
    id: string,
    firstname: string,
    lastname: string,
    refreshToken: string | null,
    email: string,
}

export class PatientMapper {
    static patientResponse = (patient: Patient): PatientResponse => {
        return {
            id: patient.id,
            firstname: patient.firstname,
            lastname: patient.lastname,
            refreshToken: patient.refresh_token,
            email: patient.email
        }
    }
}