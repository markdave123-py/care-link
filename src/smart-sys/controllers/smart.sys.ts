import type { Response, NextFunction } from "express";
import {AppError, CatchAsync, responseHandler, HttpStatus } from "../../core";
import type { AuthenticateRequest } from "../../auth/middlewares";
import type Rag from "../services/rag.service";


export class SmartSys{
    constructor(private readonly rag: Rag) {}
    public getHpBySymptom = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction) =>{
        const { symptom } = req.body;

        if (!symptom || typeof symptom !== 'string' || symptom.trim().length < 3) {
            return next(new AppError("Invalid symptoms!", HttpStatus.BAD_REQUEST))
          }

        const healthPractitioners = await this.rag.getHPsbySymptom(symptom)

        if (healthPractitioners.length === 0) {
            return next(new AppError("No health practitioner for this symptom", HttpStatus.NOT_FOUND))
        }

        return responseHandler.success(res, HttpStatus.OK, "Health Pratitioners sucessfully retrieved",healthPractitioners)
    })
     
}