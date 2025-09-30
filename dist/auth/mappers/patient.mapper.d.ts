import type { Patient } from "../../core";
type PatientResponse = {
    id: string;
    firstname: string;
    lastname: string;
    refreshToken: string | null;
    email: string;
};
export declare class PatientMapper {
    static patientResponse: (patient: Patient) => PatientResponse;
}
export {};
