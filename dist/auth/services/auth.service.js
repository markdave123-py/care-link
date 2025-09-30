"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const core_1 = require("../../core");
class AuthService {
}
exports.AuthService = AuthService;
_a = AuthService;
AuthService.findOrCreatePatientUser = async ({ email, password, firstname, lastname }) => {
    const existingPatientUser = await core_1.Patient.findOne({ where: { email } });
    if (existingPatientUser) {
        if (existingPatientUser.password) {
            throw new core_1.AppError("You already have an account. Please use your email and password", 401);
        }
        return existingPatientUser;
    }
    else {
        await core_1.Patient.create({
            email,
            password,
            email_verified: false,
            firstname,
            lastname,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
};
//# sourceMappingURL=auth.service.js.map