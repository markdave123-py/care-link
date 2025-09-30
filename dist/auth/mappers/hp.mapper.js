"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HpMapper = void 0;
class HpMapper {
}
exports.HpMapper = HpMapper;
HpMapper.hpResponse = (hp) => {
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
//# sourceMappingURL=hp.mapper.js.map