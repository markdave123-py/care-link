import type { HealthPractitioner } from "../../core";
type HpResponse = {
    id: string;
    firstname: string;
    email: string;
    hp_type_id: string | null;
    refreshToken: string | null;
    createdAt: Date;
    UpdatedAt: Date;
};
export declare class HpMapper {
    static hpResponse: (hp: HealthPractitioner) => HpResponse;
}
export {};
