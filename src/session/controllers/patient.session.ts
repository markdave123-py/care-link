import type { Request, Response, NextFunction } from "express";
// import Send from "../../auth/utils/response.utils";
import { AppError } from "../../core";
import { RequestSession } from "../../core";
import { CatchAsync } from "../../core";
import { responseHandler } from "../../core";
import { HttpStatus } from "../../core";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export class PatientSession {
  public static requestSession = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { patient_symptoms, hp_id, ongoing_medication, time } = req.body;
    const patient_id = req.userId;

    if (!patient_id) {
      return next(new AppError("User ID is required", 400));
    }

    if (!patient_symptoms || !hp_id) {
      return next(new AppError("Symptoms and HP ID are required", 400));
    }

    const newRequest = await RequestSession.create({
      patient_id,
      health_practitioner_id: hp_id,
      patient_symptoms,
      ongoing_medication,
      time
    });

    if (!newRequest) {
      return next(new AppError("Failed to create session request", 500));
    }

    return responseHandler.success(res, HttpStatus.OK, "Session request created successfully", newRequest);
  });

  // public cancelRequest = CatchAsync.wrap(async(req: Request, res : Response, next: NextFunction) : Promise<void> => {
  //   const patient_id = req.userId;
  //   const {requestSession_id} = req.body;

  // })
}

// export const patientSession = new RequestSession();
