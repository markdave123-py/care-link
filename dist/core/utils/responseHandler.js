"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
class ResponseHandler {
    success(res, statusCode, message, data) {
        res.status(statusCode).json({
            status: "success",
            message,
            data: data !== null && data !== void 0 ? data : null,
        });
    }
    error(res, error) {
        var _a, _b;
        res.status((_a = error.statusCode) !== null && _a !== void 0 ? _a : 500).json({
            status: "error",
            message: error.message || "Something went wrong",
            data: (_b = error.data) !== null && _b !== void 0 ? _b : null,
        });
    }
}
exports.responseHandler = new ResponseHandler();
//# sourceMappingURL=responseHandler.js.map