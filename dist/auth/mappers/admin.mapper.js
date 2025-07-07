"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMapper = void 0;
class AdminMapper {
}
exports.AdminMapper = AdminMapper;
AdminMapper.adminResponse = (admin) => {
    return {
        id: admin.id,
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email
    };
};
//# sourceMappingURL=admin.mapper.js.map