import { Patient } from "../../core";
export declare class AuthService {
    static findOrCreatePatientUser: ({ email, password, firstname, lastname }: {
        email: string;
        password: string;
        firstname: string;
        lastname: string;
    }) => Promise<Patient | undefined>;
}
