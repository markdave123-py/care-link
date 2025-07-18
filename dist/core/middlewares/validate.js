"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidator = void 0;
const utils_1 = require("../utils");
class RequestValidator {
}
exports.RequestValidator = RequestValidator;
RequestValidator.validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return next(new utils_1.AppError(error.details[0].message, 400));
        }
        next();
    };
};
//# sourceMappingURL=validate.js.map