import type { Response } from "express";
declare class ResponseHandler {
    success<T>(res: Response, statusCode: number, message: string, data?: T): void;
    error(res: Response, error: {
        statusCode?: number;
        message: string;
        data?: unknown;
    }): void;
}
export declare const responseHandler: ResponseHandler;
export {};
