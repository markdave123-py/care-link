"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const utils_1 = require("../utils");
class ErrorMiddleware {
    static handleError(err, req, res, _next) {
        const statusCode = (err instanceof utils_1.AppError ? err.statusCode : 500);
        const status = (err instanceof utils_1.AppError ? err.status : "error");
        const message = (err instanceof utils_1.AppError ? err.message : "Internal Server Error");
        if (!(err instanceof utils_1.AppError)) {
            console.error("Unexpected error:", err);
        }
        res.status(statusCode).json({
            status,
            message,
        });
    }
}
exports.ErrorMiddleware = ErrorMiddleware;
//# sourceMappingURL=errorHandler.js.map