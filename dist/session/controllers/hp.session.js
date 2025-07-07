"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HpSession = void 0;
const core_1 = require("../../core");
const services_1 = require("../services");
const mailerService = new services_1.MailerService();
class HpSession {
}
exports.HpSession = HpSession;
_a = HpSession;
HpSession.declineRequest = core_1.CatchAsync.wrap(async (req, res, next) => {
    const hp_id = req.userId;
    const { request_session_id } = req.params;
    const { reason } = req.body;
    const request_session = await core_1.RequestSession.findByPk(request_session_id);
    if (!request_session) {
        return next(new core_1.AppError("Session request not found!", core_1.HttpStatus.NOT_FOUND));
    }
    if (request_session.health_practitioner_id !== hp_id) {
        return next(new core_1.AppError("You are not authorized to do this!", core_1.HttpStatus.UNAUTHORIZED));
    }
    const patient_id = request_session.patient_id;
    const patient = await core_1.Patient.findByPk(patient_id);
    if (!patient) {
        return next(new core_1.AppError("Patient not found!", core_1.HttpStatus.NOT_FOUND));
    }
    request_session.status = "rejected";
    await request_session.save();
    await mailerService.sendPatientSessionRejection(patient.email, `Cancellation reason: ${reason}`);
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session Request declined successfully!");
});
HpSession.acceptRequest = core_1.CatchAsync.wrap(async (req, res, next) => {
    const hp_id = req.userId;
    const { request_session_id } = req.params;
    const request_session = await core_1.RequestSession.findByPk(request_session_id);
    if ((!request_session) || (request_session.status !== "pending") || (request_session.health_practitioner_id !== hp_id)) {
        return next(new core_1.AppError("Session request cannot be accepted!, please ensure all fields are properly filled and try again.", core_1.HttpStatus.NOT_FOUND));
    }
    const patient_id = request_session.patient_id;
    const patient = await core_1.Patient.findByPk(patient_id);
    if (!patient) {
        return next(new core_1.AppError("Patient not found!", core_1.HttpStatus.NOT_FOUND));
    }
    request_session.status = "accepted";
    await request_session.save();
    const newSession = await core_1.Session.create({
        patient_id: request_session.patient_id,
        health_practitioner_id: hp_id,
        patient_symptoms: request_session.patient_symptoms,
        status: "scheduled",
        health_practitioner_report: "",
        diagnosis: "",
        prescription: "",
        rating: 0
    });
    await mailerService.sendPatientSessionAcceptance(patient.email, `Your session request with  ${request_session} has been accepted! `);
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session Request accepted successfully!", newSession);
});
HpSession.startSession = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { sessionId } = req.params;
    const session = await core_1.Session.findByPk(sessionId);
    if (!session) {
        return next(new core_1.AppError("Session not found!", core_1.HttpStatus.NOT_FOUND));
    }
    session.status = "inprogress";
    await session.save();
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session started successfully!");
});
HpSession.endSession = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { sessionId } = req.params;
    const session = await core_1.Session.findByPk(sessionId);
    if (!(session === null || session === void 0 ? void 0 : session.prescription) || !(session === null || session === void 0 ? void 0 : session.diagnosis) || !(session === null || session === void 0 ? void 0 : session.health_practitioner_report)) {
        return next(new core_1.AppError("Session is not yet complete!", core_1.HttpStatus.BAD_REQUEST));
    }
    if (!session) {
        return next(new core_1.AppError("Session not found!", core_1.HttpStatus.NOT_FOUND));
    }
    session.status = "completed";
    await session.save();
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session ended successfully!");
});
HpSession.followupSession = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { sessionId } = req.params;
    const session = await core_1.Session.findByPk(sessionId);
    if (!session) {
        return next(new core_1.AppError("Session not found!", core_1.HttpStatus.NOT_FOUND));
    }
    session.status = "followup";
    await session.save();
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session follow-up initiated successfully!");
});
HpSession.updateSessionDetails = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { sessionId } = req.params;
    const { health_practitioner_report, diagnosis, prescription } = req.body;
    const session = await core_1.Session.findByPk(sessionId);
    if (!session) {
        return next(new core_1.AppError("Session not found!", core_1.HttpStatus.NOT_FOUND));
    }
    if (session.status == "completed") {
        return next(new core_1.AppError("Session is already completed, you cannot update it anymore!", core_1.HttpStatus.BAD_REQUEST));
    }
    session.health_practitioner_report = health_practitioner_report;
    session.diagnosis = diagnosis;
    session.prescription = prescription;
    await session.save();
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session details updated successfully!");
});
HpSession.createFollowUpSession = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { parentSessionId } = req.params;
    const { patient_symptoms } = req.body;
    const parentSession = await core_1.Session.findByPk(parentSessionId);
    if (!parentSession) {
        return next(new core_1.AppError("Parent session not found", core_1.HttpStatus.NOT_FOUND));
    }
    const followUpSession = await core_1.Session.create({
        patient_id: parentSession.patient_id,
        health_practitioner_id: parentSession.health_practitioner_id,
        patient_symptoms,
        status: 'scheduled',
        parentId: parentSession.id,
        health_practitioner_report: "",
        diagnosis: "",
        prescription: "",
        rating: 0
    });
    if (!followUpSession) {
        return next(new core_1.AppError("Failed to create follow-up session", core_1.HttpStatus.INTERNAL_SERVER_ERROR));
    }
    const patient = await core_1.Patient.findByPk(followUpSession.patient_id);
    if (patient) {
        await mailerService.sendPatientSessionAcceptance(patient.email, `A follow-up session has been created for you with symptoms: ${parentSession.patient_symptoms}`);
    }
    const healthPractitioner = await core_1.HealthPractitioner.findByPk(followUpSession.health_practitioner_id);
    if (healthPractitioner) {
        await mailerService.sendPatientSessionAcceptance(healthPractitioner.email, `A follow-up session has been created for patient: ${patient === null || patient === void 0 ? void 0 : patient.firstname} ${patient === null || patient === void 0 ? void 0 : patient.lastname}`);
    }
    parentSession.status = "havefollowup";
    await parentSession.save();
    return core_1.responseHandler.success(res, core_1.HttpStatus.CREATED, "Follow-up session created", followUpSession);
});
//# sourceMappingURL=hp.session.js.map