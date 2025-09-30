export interface PatientAttributes {
    id: string;
    email: string;
    email_verified: boolean;
    firstname: string;
    lastname: string;
    password: string;
    profile_picture: string | null;
    refresh_token: string | null;
    createdAt: Date;
    updatedAt: Date;
}
