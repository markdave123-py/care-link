"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Send {
    static success(res, message, data) {
        res.status(200).json({
            status: "success",
            message,
            data
        });
        return;
    }
    static error(res, status = "error", message = "", data) {
        res.status(500).json({
            status,
            message,
            data
        });
        return;
    }
    static notFound(res, status = "Not Found", message = "", data) {
        res.status(404).json({
            status,
            message,
            data
        });
        return;
    }
    static unauthorized(res, message = "", data) {
        res.status(401).json({
            status: "Unauthorized",
            message,
            data
        });
        return;
    }
    static validationErrors(res, errors) {
        res.status(422).json({
            ok: false,
            message: "Validation error",
            errors
        });
        return;
    }
    static forbidden(res, status = "Forbidden", message = "", data) {
        res.status(403).json({
            status,
            message,
            data
        });
        return;
    }
    static badRequest(res, status = "Bad Request", message = "", data) {
        res.status(400).json({
            status,
            message,
            data
        });
        return;
    }
}
exports.default = Send;
//# sourceMappingURL=response.utils.js.map