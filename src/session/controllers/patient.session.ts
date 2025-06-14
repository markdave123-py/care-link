import { Request, Response, NextFunction } from "express"
// import { responseHandler } from "../../core";
import  Send  from "../../auth/utils/response.utils";
import {Session} from "../../core";
import { AppError } from "../../core";
import { RequestSession } from "../../core";
import { CatchAsync } from "../../core";
import { AuthenticateRequest } from "src/auth/middlewares";

// Extend Express Request interface to include userId
declare module "express-serve-static-core" {
    interface Request {
        userId?: number;
    }
}

export class PatientSession{
    requestSession = CatchAsync.wrap(async (req: Request, res: Response, next : NextFunction) => {
        const {symptoms, hp_id} = req.body;
        const patient_id = req.userId as number | undefined;
        if (!patient_id) {
            return next(new AppError("User ID is required", 400));
        }
        if (!symptoms || !hp_id) {
            return next(new AppError("Symptoms and HP ID are required", 400));
        }
        const newRequest = await RequestSession.create({
            patient_id,
            health_practitioner_id: hp_id,
            symptoms
        });
        if(!newRequest) {
            return next(new AppError("Failed to create session request", 500));
        }
        return Send.success(res, newRequest, "Session request created successfully" );
        
    } )
}