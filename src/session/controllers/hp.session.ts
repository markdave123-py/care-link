import type { Response, NextFunction } from "express";
import { RequestSession, Patient, HealthPractitioner, Session, AppError, CatchAsync, responseHandler, HttpStatus, createGoogleMeetEvent } from "../../core";
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
            rating: 0,
            start_time : request_session.start_time,
            end_time : request_session.end_time
        })
        const meetingLink = createGoogleMeetEvent(newSession.id, newSession.start_time.toISOString(), newSession.end_time.toISOString());
        await mailerService.sendPatientSessionAcceptance(patient.email, `Your session request with has been accepted! Join at the designated time with this link : ${meetingLink}`)
        return responseHandler.success(res, HttpStatus.OK, "Session Request accepted successfully!", newSession);
    })


//This endpoint is responsible for starting a session officially also means kicking the session off by a hp (protect this route with hp role checking middleware)
    public static startSession = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next) =>{
        // const hp_id = req.userId;
        const {sessionId} = req.params;
        const session = await Session.findByPk(sessionId);
        if(!session){
            return next(new AppError("Session not found!", HttpStatus.NOT_FOUND));
        }
        session.status = "inprogress";
        await session.save();
        return responseHandler.success(res, HttpStatus.OK, "Session started successfully!", session);

    })
//The purpose of this route is to end the session officially when the meeting is over(protect this route with hp role checking middleware)
    public static endSession = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next) =>{
        const {sessionId} = req.params;
        const session = await Session.findByPk(sessionId);
        if(!session?.prescription || !session?.diagnosis || !session?.health_practitioner_report){
            return next(new AppError("Session is not yet complete!", HttpStatus.BAD_REQUEST));
        }
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
    //This is where the health practitioner can add their report, diagnosis and prescription and it can only be done when the session is not completed yet
    public static updateSessionDetails = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next: NextFunction) =>{
        const {sessionId} = req.params;
        const {health_practitioner_report, diagnosis, prescription} = req.body;
        const session = await Session.findByPk(sessionId);
        if(!session){
            return next(new AppError("Session not found!", HttpStatus.NOT_FOUND));
        }
        if(session.status == "completed"){
            return next(new AppError("Session is already completed, you cannot update it anymore!", HttpStatus.BAD_REQUEST));
        }
        session.health_practitioner_report = health_practitioner_report;
        session.diagnosis = diagnosis;
        session.prescription = prescription;
        await session.save();
        return responseHandler.success(res, HttpStatus.OK, "Session details updated successfully!");
    })
//This endpoint is responsible for creating a follow-up session based on a parent session (protect this route with hp role checking middleware)
    //This is where the health practitioner can create a follow-up session for a patient based on a parent session
    public static createFollowUpSession = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
        const { parentSessionId } = req.params;
        const { time } = req.body;

        const parentSession = await Session.findOne({ where: { id: parentSessionId } });
        // Normal parent session validation
        if (!parentSession) {
            return next(new AppError("Parent session not found", HttpStatus.NOT_FOUND));
        }
        if(parentSession.status !== "completed"){
            return next(new AppError("Parent session must be completed before creating a follow-up session", HttpStatus.BAD_REQUEST));
        }
        const startDate = new Date(time);  // convert payload string to Date
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // +30 mins

        const followUpSession = await Session.create({
            patient_id: parentSession.patient_id,
            health_practitioner_id: parentSession.health_practitioner_id,
            patient_symptoms : parentSession.patient_symptoms,
            status: 'scheduled',
            parentId: parentSession.id,
            health_practitioner_report: "",
            diagnosis: "",
            prescription: "",
            rating: 0,
            start_time : startDate,
            end_time : endDate
        });

        // If the follow-up session creation fails, return an error
        if (!followUpSession) {
            return next(new AppError("Failed to create follow-up session", HttpStatus.INTERNAL_SERVER_ERROR));
        }

        // Send a notification to the patient about the follow-up session
        const patient = await Patient.findByPk(followUpSession.patient_id);
        if (!patient) {
            return next(new AppError("Patient not found", HttpStatus.NOT_FOUND));
        }   

        // Send a notification to the health practitioner as well
        const healthPractitioner = await HealthPractitioner.findByPk(followUpSession.health_practitioner_id);
        if (!healthPractitioner) {
            return next(new AppError("Health practitioner not found", HttpStatus.NOT_FOUND));
        }

        //Send notification emails to both patient and health practitioner
        await mailerService.sendPatientSessionAcceptance(patient.email, `A follow-up session has been created for you with symptoms: ${parentSession.patient_symptoms}`);
        await mailerService.sendPractitionerFollowUpSessionAlert(healthPractitioner.email, `A follow-up session has been created for patient: ${patient?.firstname} ${patient?.lastname}`, patient?.firstname);

        //update status of the parent session to havefollowup
        parentSession.status = "havefollowup";
        await parentSession.save();
        return responseHandler.success(res, HttpStatus.CREATED, "Follow-up session created", followUpSession);
    });

}