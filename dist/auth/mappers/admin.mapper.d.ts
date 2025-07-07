import type { Admin } from "../../core";
type AdminResponse = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
};
export declare class AdminMapper {
    static adminResponse: (admin: Admin) => AdminResponse;
}
export {};
