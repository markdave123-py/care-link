import type { Admin } from "../../core";
type AdminResponse = {
    id: string;
    firstname: string;
    lastname: string;
    refreshToken: string | null;
    email: string;
};
export declare class AdminMapper {
    static adminResponse: (admin: Admin) => AdminResponse;
}
export {};
