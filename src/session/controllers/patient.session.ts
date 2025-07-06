import type { Response, NextFunction } from "express";
// import Send from "../../auth/utils/response.utils";
import { RequestSession, Patient, Session, HealthPractitioner, AppError, CatchAsync, responseHandler, HttpStatus } from "../../core";
import type { AuthenticateRequest } from "../../auth/middlewares";
import { MailerService } from "../services";
// import { generatePrescriptionPDF } from "../services";
// import { where } from "sequelize";
const mailerService = new MailerService();
// declare module "express-serve-static-core" {
//   interface Request {
//     userId?: string;
//   }
// }

export class PatientSession {
  //Allows a patient to request a session
  public static requestSession = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
    const { patient_symptoms, hp_id, ongoing_medication, time} = req.body;
    // const patient_id = req.userId;
    if (!patient_symptoms || !hp_id || !time) {
      return next(new AppError("All fields are required", HttpStatus.BAD_REQUEST));
    }
    const patient = await Patient.findByPk(req.userId);

    const healthPracticioner = await HealthPractitioner.findByPk(hp_id);
    if (!healthPracticioner) {
      return next(new AppError("Health Practitioner not found", HttpStatus.NOT_FOUND));
    }
    if (!patient) {
      return next(new AppError("Patient not found", HttpStatus.NOT_FOUND));
    }

    const newRequest = await RequestSession.create({
      patient_id : req.userId,
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
    // const acceptLink = `${process.env.CLIENT_URL}/sessions/${newRequest.id}/accept-request`;
    // const rejectLink = `${process.env.CLIENT_URL}/sessions/${newRequest.id}/decline-request`;


    return responseHandler.success(res, HttpStatus.OK, "Session request created successfully", newRequest);
  });
// Allows a patient to cancel a session request
  public static cancelRequest = CatchAsync.wrap(async(req: AuthenticateRequest, res : Response, next: NextFunction) : Promise<void> => {
    const patient_id = req.userId;
    const {requestSession_id} = req.params;
    const requestSession = await RequestSession.findByPk(requestSession_id);
    const patient = await Patient.findByPk(patient_id);
    const healthPractitioner = await HealthPractitioner.findByPk(requestSession?.health_practitioner_id);
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
    if (!healthPractitioner || !patient) {
      return next(new AppError("Health Practitioner or patient not found", HttpStatus.NOT_FOUND));
    }
    await mailerService.sendPatientCancelationEmail(
      patient.email,
      `Health Practitioner Name:  ${healthPractitioner.firstname} ${healthPractitioner.lastname}, Scheduled Time: ${requestSession.time.toString()}`
    );  
    await mailerService.sendPractitionerCancelationEmail(
      healthPractitioner.email,
      `Patient Name:  ${patient.firstname} ${patient.lastname}, Scheduled Time: ${requestSession.time.toString()}`
    );
    await requestSession.save();
    return responseHandler.success(res, HttpStatus.OK, "Session request cancelled successfully", requestSession);
  });
//Allows a patient to get their session request history
  public static getPatientSessions = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
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

  public static rateSession = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
    const { rating } = req.body;
    const patient_id = req.userId;
    const { sessionId } = req.params;

    if (!rating) {
      return next(new AppError("Rating is required", HttpStatus.BAD_REQUEST));
    }

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return next(new AppError("Session not found", HttpStatus.NOT_FOUND));
    }

    if (session.patient_id !== patient_id) {
      return next(new AppError("You are not authorized to rate this session", HttpStatus.UNAUTHORIZED));
    }
    if(session.status != "completed"){
      return next(new AppError("Session not completed yet", HttpStatus.UNAUTHORIZED))
    }

    session.rating = rating as number;
    await session.save();

    return responseHandler.success(res, HttpStatus.OK, "Session rated successfully", session);
  })

  public static downloadPrescription = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
    const { sessionId } = req.params;

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return next(new AppError("Session not found", HttpStatus.NOT_FOUND));
    }

    if (session.patient_id !== req.userId) {
      return next(new AppError("You are not authorized to download this prescription", HttpStatus.UNAUTHORIZED));
    }

    // generatePrescriptionPDF(session, res);
  })
}

// export const patientSession = new RequestSession();
