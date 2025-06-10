import type { Response } from "express";

class Send {
    static success(res: Response, data: unknown, message = "success") {
        res.status(200).json({
            ok: true,
            message,
            data
        })
        return;
    }

    static error(res: Response, data: unknown, message = "error") {
        res.status(500).json({
            ok: false,
            message,
            data
        })
        return;
    }

    static notFound(res: Response, data: unknown, message = "Not Found") {
        res.status(404).json({
            ok: false,
            message,
            data
        })
        return;
    }

    static unauthorized(res:Response, data: unknown, message = "unathorized") {
        res.status(401).json({
            ok: false,
            message,
            data
        })
        return;
    }

    static validationErrors(res: Response, errors: Record<string, string[]>) {
        res.status(422).json({
            ok: false,
            message: "Validation error",
            errors
        })
        return;
    }

    static forbidden(res: Response, data: unknown, message = "Forbidden") {
        res.status(403).json({
            ok: false,
            message,
            data
        })
        return;
    }

    static badRequest(res: Response, data: unknown, message = "Bad Request") {
        res.status(400).json({
            ok: false,
            message,
            data
        })
        return;
    }
}

export default Send;