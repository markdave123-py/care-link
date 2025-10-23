import type { Response, NextFunction } from "express";
import { Op } from "sequelize";
import { RequestSession, Patient, HealthPractitioner, AppointmentSlot, Session, AppError, CatchAsync, responseHandler, HttpStatus, createJitsiMeeting, sequelize} from "../../core";
import type { AuthenticateRequest } from "../../auth/middlewares";
import { MailerService } from "../services";
const mailerService = new MailerService();


export class HpSession{

//This endpoint is responsible for declining session request (protect this route with hp role checking middleware)
// It wraps updating the request session, and updating the appointment slot in a db transaction
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
        if (request_session.status !== "pending") {
            return next(new AppError("Only pending requests can be declined", HttpStatus.CONFLICT));
        }

        const patient_id = request_session.patient_id;
        const [patient, hp] = await Promise.all([
            Patient.findByPk(patient_id),
            HealthPractitioner.findByPk(hp_id),
        ]);
        if (!patient || !hp) return next(new AppError("Health Practitioner or patient not found", HttpStatus.NOT_FOUND));

        const t = await sequelize.transaction();
        try {
            // Optimistic guard: still pending & mine
            const [affected] = await RequestSession.update(
            { status: "rejected" },
            {
                where: { id: request_session_id, health_practitioner_id: hp_id, status: "pending" },
                transaction: t,
            }
            );
            if (affected === 0) {
            await t.rollback();
            return next(new AppError("Request is no longer pending", HttpStatus.CONFLICT));
            }

            // Free the slot by marking it rejected (pending/accepted are the “blocking” statuses)
            await AppointmentSlot.update(
            { status: "rejected" },
            {
                where: {
                request_session_id,
                status: { [Op.in]: ["pending", "accepted"] },
                },
                transaction: t,
            }
            );

            await t.commit();

            (async () => {
                try {
                  await mailerService.sendPatientSessionRejection(
                    patient.email,
                    `Cancellation reason: ${reason || "No reason provided"}`
                  );
                } catch { }
            })();
            return responseHandler.success(res, HttpStatus.OK, "Session request declined successfully!");

        } catch (err) {
            await t.rollback();
            return next(new AppError("Failed to decline session request", HttpStatus.INTERNAL_SERVER_ERROR))
        }
    })

//This endpoint is responsible for accepting a session request (protect this route with hp role checking middleware)
// It wraps updating the request session, creating a new session and updating the appointment slot in a db transaction
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

        const t = await sequelize.transaction();

        try {
            // Mark request accepted 
            const [affected] = await RequestSession.update(
              { status: "accepted" },
              {
                where: { id: request_session_id, health_practitioner_id: hp_id, status: "pending" },
                transaction: t,
              }
            );
            if (affected === 0) {
              await t.rollback();
              return next(new AppError("Request is no longer pending", HttpStatus.CONFLICT));
            }

            // Mark the linked slot accepted (it was created at request time with status 'pending')
            const [slotAffected] = await AppointmentSlot.update(
                { status: "accepted" },
                {
                where: {
                    request_session_id,
                    hp_id,
                    status: "pending",
                    start_ts: { [Op.eq]: request_session.start_time },
                    end_ts:   { [Op.eq]: request_session.end_time   },
                },
                transaction: t,
                }
            );
            // If no slot found, you can choose to error or create one; here we error
            if (slotAffected === 0) {
                await t.rollback();
                return next(new AppError("Associated appointment slot not found or already taken", HttpStatus.CONFLICT));
            }

            const newSession = await Session.create({
                patient_id: patient_id,
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

            await t.commit();

            (async () => {
                try {
                  const meetingLink = createJitsiMeeting(); // or await createDailyMeeting()
                  await mailerService.sendPatientSessionAcceptance(
                    patient.email,
                    `Your session request has been accepted! Join at the designated time with this link: ${meetingLink.meetingUrl}`
                  );
                } catch { }
            })();

            return responseHandler.success(res, HttpStatus.OK, "Session request accepted successfully!", newSession);
        } catch (err: any) {
            await t.rollback();

        const pgCode = err?.original?.code;
        const constraint = err?.original?.constraint;
        if (pgCode === "23P01" && constraint === "appointment_no_overlap") {
            return next(new AppError("That slot was just taken. Please pick another time.", HttpStatus.CONFLICT));
        }
        if (pgCode === "23514" && constraint === "chk_fixed_length") {
            return next(new AppError("Invalid slot length; must be exactly 30 minutes.", HttpStatus.BAD_REQUEST));
        }
        return next(new AppError("Failed to accept session request", HttpStatus.INTERNAL_SERVER_ERROR));
        }

    });


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

    //To get all sessions for a health practitioner
    public static getHPSessions = CatchAsync.wrap(async(req: AuthenticateRequest, res: Response, next: NextFunction) : Promise<void> => {
        const hp_id = req.userId;
        const sessions =  await Session.findAll({where: {health_practitioner_id: hp_id}});
        if(!sessions){
            return next(new AppError("No sessions found for this health practitioner!", HttpStatus.NOT_FOUND));
        }
        
        return responseHandler.success(res, HttpStatus.OK, "Health Practitioner sessions retrieved successfully", sessions);
    })

}