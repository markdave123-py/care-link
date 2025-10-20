import type { HealthPractitioner } from "../../core";

export type HpResponse = {
	id: string,
	firstname: string,
	email: string,
    hp_type_id: string | null,
    refreshToken: string | null,
	createdAt: Date,
	UpdatedAt: Date,
};

export class HpMapper {
	static hpResponse = (hp: HealthPractitioner): HpResponse => {
		return {
			id: hp.id,
			firstname: hp.firstname,
			email: hp.email,
            hp_type_id: hp.hp_type_id,
            refreshToken: hp.refresh_token,
			createdAt: hp.createdAt,
			UpdatedAt: hp.updatedAt,
		};
	};
}
