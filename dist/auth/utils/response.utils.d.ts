import type { Response } from "express";
declare class Send {
    static success(res: Response, data: unknown, message?: string): void;
    static error(res: Response, data: unknown, message?: string): void;
    static notFound(res: Response, data: unknown, message?: string): void;
    static unauthorized(res: Response, data: unknown, message?: string): void;
    static validationErrors(res: Response, errors: Record<string, string[]>): void;
    static forbidden(res: Response, data: unknown, message?: string): void;
    static badRequest(res: Response, data: unknown, message?: string): void;
}
export default Send;
