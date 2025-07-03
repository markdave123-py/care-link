import type { Response, NextFunction } from "express";
import { RequestSession, Patient, Session, AppError, CatchAsync, responseHandler, HttpStatus } from "../../core";
import type { AuthenticateRequest } from "../../auth/middlewares";
import { MailerService } from "../services";
const mailerService = new MailerService();


export class HpSession{
//This endpoint is responsible for declining session request (protect this route with hp role checking middleware)
    public static declineRequest = CatchAsync.wrap(async (req:AuthenticateRequest, res: Response, next: NextFunction) => {
        const hp_id = req.userId;
        const { request_session_id } = req.params
        const { reason } = req.body;

        const request_session = await RequestSession.findByPk(request_session_id);
        if (!request_session) {
            return next(new AppError("Session request not found!", HttpStatus.NOT_FOUND));
        }
        if (request_session.health_practitioner_id !== hp_id){
            return next(new AppError("You are not authorized to do this!", HttpStatus.UNAUTHORIZED));
        }
        const patient_id = request_session.patient_id;
        const patient = await Patient.findByPk(patient_id);
        if(!patient){
            return next(new AppError("Patient not found!", HttpStatus.NOT_FOUND));
        }
        request_session.status = "rejected";
        await request_session.save();
        await mailerService.sendPatientSessionRejection(patient.email, `Cancellation reason: ${reason}`)
        return responseHandler.success(res, HttpStatus.OK, "Session Request declined successfully!");

    })
//This endpoint is responsible for accepting a session request (protect this route with hp role checking middleware)
    public static acceptRequest = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next: NextFunction) =>{
        const hp_id = req.userId;
        const {request_session_id} = req.params;
        const request_session = await RequestSession.findByPk(request_session_id);
        if((!request_session ) || (request_session.status !== "pending") || (request_session.health_practitioner_id !== hp_id) ){
            return next(new AppError("Session request cannot be accepted!, please ensure all fields are properly filled and try again.", HttpStatus.NOT_FOUND));
        }
        const patient_id = request_session.patient_id;
        const patient = await Patient.findByPk(patient_id);
        if(!patient){
            return next(new AppError("Patient not found!", HttpStatus.NOT_FOUND));
        }
        request_session.status = "accepted";
        await request_session.save();
        const newSession = await Session.create({
            patient_id: request_session.patient_id,
            health_practitioner_id: hp_id,
            patient_symptoms: request_session.patient_symptoms,
            status: "scheduled",
            health_practitioner_report: "",
            diagnosis: "",
            prescription: "",
            rating: 0
        })
        await mailerService.sendPatientSessionAcceptance(patient.email, `Your session request with  ${request_session} has been accepted! `)
        return responseHandler.success(res, HttpStatus.OK, "Session Request accepted successfully!", newSession);
    })
//This endpoint is responsible for starting a session officailly also means kicking the session off by a hp (protect this route with hp role checking middleware)
    public static startSession = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next) =>{
        // const hp_id = req.userId;
        const {sessionId} = req.params;
        const session = await Session.findByPk(sessionId);
        if(!session){
            return next(new AppError("Session not found!", HttpStatus.NOT_FOUND));
        }
        session.status = "inprogress";
        await session.save();
        return responseHandler.success(res, HttpStatus.OK, "Session started successfully!");

    })
//The purpose of this route is to end the session officially when the meeting is over(protect this route with hp role checking middleware)
    public static endSession = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next) =>{
        const {sessionId} = req.params;
        const session = await Session.findByPk(sessionId);
        if(!session){
            return next(new AppError("Session not found!", HttpStatus.NOT_FOUND));
        }
        session.status = "completed";
        await session.save();
        return responseHandler.success(res, HttpStatus.OK, "Session ended successfully!");
    })
//The purpose of this route is incase there is a followup session, to link them up(protect this route with hp role checking middleware)
    public static followupSession = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next: NextFunction) =>{
        const {sessionId} = req.params;
        const session = await Session.findByPk(sessionId);
        if(!session){
            return next(new AppError("Session not found!", HttpStatus.NOT_FOUND));
        }
        session.status = "followup";
        await session.save();
        return responseHandler.success(res, HttpStatus.OK, "Session follow-up initiated successfully!");
    })
//This endpoint is responsible for updating session details by a health practitioner (protect this route with hp role checking middleware)
    //This is where the health practitioner can add their report, diagnosis and prescription 
    public static updateSessionDetails = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next: NextFunction) =>{
        const {sessionId} = req.params;
        const {health_practitioner_report, diagnosis, prescription} = req.body;
        const session = await Session.findByPk(sessionId);
        if(!session){
            return next(new AppError("Session not found!", HttpStatus.NOT_FOUND));
        }
        session.health_practitioner_report = health_practitioner_report;
        session.diagnosis = diagnosis;
        session.prescription = prescription;
        await session.save();
        return responseHandler.success(res, HttpStatus.OK, "Session details updated successfully!");
    })
}