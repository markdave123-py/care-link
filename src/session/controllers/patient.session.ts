import type { Request, Response, NextFunction } from "express";
// import Send from "../../auth/utils/response.utils";
import { AppError } from "../../core";
import { RequestSession, Patient } from "../../core";
import { CatchAsync } from "../../core";
import { responseHandler } from "../../core";
import { HttpStatus } from "../../core";
import { MailerService } from "../services";
import { where } from "sequelize";
const mailerService = new MailerService();
declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export class PatientSession {
  public static requestSession = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { patient_symptoms, hp_id, ongoing_medication, time, patient_id } = req.body;
    // const patient_id = req.userId;
    const patient = await Patient.findOne({where: {id: patient_id}});
    const healthPracticioner = await Patient.findOne({where: {id: hp_id}});
    if (!healthPracticioner) {
      return next(new AppError("Health Practitioner not found", HttpStatus.NOT_FOUND));
    }
    if (!patient) {
      return next(new AppError("Patient not found", HttpStatus.NOT_FOUND));
    }
    if (!patient_id) {
      return next(new AppError("User ID is required", HttpStatus.BAD_REQUEST));
    }
    if (!patient_symptoms || !hp_id) {
      return next(new AppError("Symptoms and HP ID are required", HttpStatus.BAD_REQUEST));
    }

    const newRequest = await RequestSession.create({
      patient_id,
      health_practitioner_id: hp_id,
      patient_symptoms,
      ongoing_medication,
      time
    });

    await mailerService.sendSessionRequestAlert(
      healthPracticioner.email, 
      patient.firstname,
      time.toString()
    );

    if (!newRequest) {
      return next(new AppError("Failed to create session request", HttpStatus.INTERNAL_SERVER_ERROR));
    }

    return responseHandler.success(res, HttpStatus.OK, "Session request created successfully", newRequest);
  });

  public static cancelRequest = CatchAsync.wrap(async(req: Request, res : Response, next: NextFunction) : Promise<void> => {
    const patient_id = req.userId;
    const {requestSession_id} = req.body;
    const requestSession = await RequestSession.findOne({where: {id : requestSession_id}});
    if (!requestSession) {
      return next(new AppError("Session request not found", HttpStatus.NOT_FOUND));
    }
    if (requestSession.patient_id !== patient_id) {
      return next(new AppError("You are not authorized to cancel this session request", HttpStatus.UNAUTHORIZED));
    }
    if (requestSession.status !== "pending") {
      return next(new AppError("Only pending requests can be cancelled", HttpStatus.BAD_REQUEST));
    }
    requestSession.status = "cancelled";
    await requestSession.save();
    return responseHandler.success(res, HttpStatus.OK, "Session request cancelled successfully", requestSession);
  });

  public static getPatientSessions = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const patient_id = req.userId;

    if (!patient_id) {
      return next(new AppError("User ID is required", HttpStatus.BAD_REQUEST));
    }

    const sessions = await RequestSession.findAll({
      where: { patient_id },
      order: [["createdAt", "DESC"]],
    });

    if (!sessions || sessions.length === 0) {
      return responseHandler.success(res, HttpStatus.OK, "No session requests found for this patient", []);
    }

    return responseHandler.success(res, HttpStatus.OK, "Session requests retrieved successfully", sessions);
  });
}

// export const patientSession = new RequestSession();
