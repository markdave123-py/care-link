"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const response_utils_1 = require("../utils/response.utils");
const core_1 = require("../../core");
class UserController {
}
_a = UserController;
UserController.getUser = async (req, res) => {
    try {
        const userId = req.userId;
        console.log(userId);
        const user = await core_1.Patient.findOne({
            where: { id: userId }
        });
        if (!user) {
            return response_utils_1.default.notFound(res, { message: "User not found" });
        }
        return response_utils_1.default.success(res, { message: "User found successfully" });
    }
    catch (err) {
        console.error("Error getting user: ", err);
        return response_utils_1.default.error(res, { message: "Error getting user" });
    }
};
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map