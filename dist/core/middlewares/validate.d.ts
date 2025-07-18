import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
export declare class RequestValidator {
    static validate: (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
}
