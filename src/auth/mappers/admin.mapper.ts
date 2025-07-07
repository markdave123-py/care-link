import type { Admin } from "src/core";

type AdminResponse = {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
}

export class AdminMapper {
    static adminResponse = (admin: Admin): AdminResponse => {
        return {
            id: admin.id,
            firstname: admin.firstname,
            lastname: admin.lastname,
            email: admin.email
        }
    }
}