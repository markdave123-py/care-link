"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Send {
    static success(res, data, message = "success") {
        res.status(200).json({
            ok: true,
            message,
            data
        });
        return;
    }
    static error(res, data, message = "error") {
        res.status(500).json({
            ok: false,
            message,
            data
        });
        return;
    }
    static notFound(res, data, message = "Not Found") {
        res.status(404).json({
            ok: false,
            message,
            data
        });
        return;
    }
    static unauthorized(res, data, message = "unathorized") {
        res.status(401).json({
            ok: false,
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
    static forbidden(res, data, message = "Forbidden") {
        res.status(403).json({
            ok: false,
            message,
            data
        });
        return;
    }
    static badRequest(res, data, message = "Bad Request") {
        res.status(400).json({
            ok: false,
            message,
            data
        });
        return;
    }
}
exports.default = Send;
//# sourceMappingURL=response.utils.js.map