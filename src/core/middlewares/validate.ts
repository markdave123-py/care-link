import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import { AppError } from "../utils";

export class RequestValidator {
    static validate = (schema: ObjectSchema) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const { error } = schema.validate(req.body);

            if (error) {
                return next(new AppError(error.details[0].message, 400))
            }
            next()
        }
    }
}