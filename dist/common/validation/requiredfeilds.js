"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFields = requireFields;
const core_1 = require("../../core");
function requireFields(body, next, ...fields) {
    if (body === undefined || body === null || typeof body !== 'object') {
        return next(new core_1.AppError('Request body is missing', core_1.HttpStatus.BAD_REQUEST));
    }
    const obj = body;
    const missing = fields.filter(f => obj[f] === undefined);
    if (missing.length) {
        return next(new core_1.AppError(`Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`, core_1.HttpStatus.BAD_REQUEST));
    }
}
//# sourceMappingURL=requiredfeilds.js.map