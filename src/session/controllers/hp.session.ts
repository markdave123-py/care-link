import type { Response, NextFunction } from "express";
import { RequestSession, Patient, HealthPractitioner, Session, AppError, CatchAsync, responseHandler, HttpStatus } from "../../core";
import type { AuthenticateRequest } from "../../auth/middlewares";
import { MailerService } from "../services";
const mailerService = new MailerService();


export class HpSession{

    public static declineRequest = CatchAsync.wrap(async (req:AuthenticateRequest, res: Response, next: NextFunction) => {
        const hp_id = req.userId;
        const {request_session_id, reason} = req.body;
        const request_session = await RequestSession.findByPk(request_session_id);
        if(request_session.health_practitioner_id !== hp_id){
            return next(new AppError("You are not authorized to do this!"));
        }
        const patient_id = request_session.patient_id;
        const patient = await Patient.findByPk(patient_id);
        request_session.status = "rejected";
        await request_session.save();
        await mailerService.sendPatientSessionRejection(patient.email, `Cancellation reason: ${reason}`)
        return responseHandler.success(res, HttpStatus.OK, "Session Request declined successfully!");

    })

    public static acceptRequest = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next: NextFunction) =>{
        const hp_id = req.userId;
        const {request_session_id, reason} = req.body;
        const request_session = await RequestSession.findByPk(request_session_id);
        if(request_session.health_practitioner_id !== hp_id){
            return next(new AppError("You are not authorized to do this!"));
        }
        const patient_id = request_session.patient_id;
        const patient = await Patient.findByPk(patient_id);
        request_session.status = "accepted";
        await request_session.save();
        await Session.create({
            patient_id : request_session.patient_id,
            health_practitioner_id : hp_id,
            patient_symptoms : request_session.patient_symptoms,
        })
        await mailerService.sendPatientSessionAcceptance(patient.email, `Your session request ${request_session} has been accepted! `)
        return responseHandler.success(res, HttpStatus.OK, "Session Request declined successfully!");
    })
}