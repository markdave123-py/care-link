import type { Response } from "express";
declare class Send {
    static success(res: Response, message: string, data?: unknown): void;
    static error(res: Response, status: string | undefined, message: string | undefined, data: unknown): void;
    static notFound(res: Response, status: string | undefined, message: string | undefined, data: unknown): void;
    static unauthorized(res: Response, message?: string, data?: unknown): void;
    static validationErrors(res: Response, errors: Record<string, string[]>): void;
    static forbidden(res: Response, status: string | undefined, message: string | undefined, data: unknown): void;
    static badRequest(res: Response, status: string | undefined, message: string | undefined, data: unknown): void;
}
export default Send;
