import type { Admin } from "../../core";

type AdminResponse = {
    id: string,
    firstname: string,
    lastname: string,
    refreshToken: string | null,
    email: string,
}

export class AdminMapper {
    static adminResponse = (admin: Admin): AdminResponse => {
        return {
            id: admin.id,
            firstname: admin.firstname,
            lastname: admin.lastname,
            refreshToken: admin.refresh_token,
            email: admin.email
        }
    }
}