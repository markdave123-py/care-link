import type { Admin } from "../../core";

type AdminResponse = {
    id: string,
    firstname: string,
    lastname: string,
    accessToken: string | null,
    refreshToken: string | null,
    email: string,
}

export class AdminMapper {
    static adminResponse = (admin: Admin & Record<string, any>): AdminResponse => {
        return {
            id: admin.id,
            firstname: admin.firstname,
            lastname: admin.lastname,
            accessToken: admin.access_token,
            refreshToken: admin.refresh_token,
            email: admin.email
        }
    }
}