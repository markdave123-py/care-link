import type { Response } from "express";

class Send {
    static success(res: Response, message: string, data?: unknown) {
        res.status(200).json({
            status: "success",
            message,
            data
        })
        return;
    }

    static error(res: Response, status = "error", message = "", data: unknown) {
        res.status(500).json({
            status,
            message,
            data
        })
        return;
    }

    static notFound(res: Response, status = "Not Found", message = "", data: unknown) {
        res.status(404).json({
            status,
            message,
            data
        })
        return;
    }

    static unauthorized(res:Response, message = "", data?: unknown) {
        res.status(401).json({
            status: "Unauthorized",
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

    static forbidden(res: Response, status = "Forbidden", message = "", data: unknown) {
        res.status(403).json({
            status,
            message,
            data
        })
        return;
    }

    static badRequest(res: Response, status = "Bad Request", message = "", data: unknown) {
        res.status(400).json({
            status,
            message,
            data
        })
        return;
    }
}

export default Send;