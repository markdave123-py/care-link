"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientSession = void 0;
const core_1 = require("../../core");
const services_1 = require("../services");
const mailerService = new services_1.MailerService();
class PatientSession {
}
exports.PatientSession = PatientSession;
_a = PatientSession;
PatientSession.requestSession = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { patient_symptoms, hp_id, ongoing_medication, time } = req.body;
    if (!patient_symptoms || !hp_id || !time) {
        return next(new core_1.AppError("All fields are required", core_1.HttpStatus.BAD_REQUEST));
    }
    const patient = await core_1.Patient.findByPk(req.userId);
    const healthPracticioner = await core_1.HealthPractitioner.findByPk(hp_id);
    if (!healthPracticioner) {
        return next(new core_1.AppError("Health Practitioner not found", core_1.HttpStatus.NOT_FOUND));
    }
    if (!patient) {
        return next(new core_1.AppError("Patient not found", core_1.HttpStatus.NOT_FOUND));
    }
    const startDate = new Date(time);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    const newRequest = await core_1.RequestSession.create({
        patient_id: req.userId,
        health_practitioner_id: hp_id,
        patient_symptoms,
        ongoing_medication,
        start_time: startDate,
        end_time: endDate,
    });
    await mailerService.sendSessionRequestAlert(healthPracticioner.email, patient.firstname, time.toString());
    if (!newRequest) {
        return next(new core_1.AppError("Failed to create session request", core_1.HttpStatus.INTERNAL_SERVER_ERROR));
    }
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session request created successfully", newRequest);
});
PatientSession.cancelRequest = core_1.CatchAsync.wrap(async (req, res, next) => {
    const patient_id = req.userId;
    const { requestSession_id } = req.params;
    const requestSession = await core_1.RequestSession.findByPk(requestSession_id);
    const patient = await core_1.Patient.findByPk(patient_id);
    const healthPractitioner = await core_1.HealthPractitioner.findByPk(requestSession === null || requestSession === void 0 ? void 0 : requestSession.health_practitioner_id);
    if (!requestSession) {
        return next(new core_1.AppError("Session request not found", core_1.HttpStatus.NOT_FOUND));
    }
    if (requestSession.patient_id !== patient_id) {
        return next(new core_1.AppError("You are not authorized to cancel this session request", core_1.HttpStatus.UNAUTHORIZED));
    }
    if (requestSession.status !== "pending") {
        return next(new core_1.AppError("Only pending requests can be cancelled", core_1.HttpStatus.BAD_REQUEST));
    }
    requestSession.status = "cancelled";
    if (!healthPractitioner || !patient) {
        return next(new core_1.AppError("Health Practitioner or patient not found", core_1.HttpStatus.NOT_FOUND));
    }
    await mailerService.sendPatientCancelationEmail(patient.email, `Health Practitioner Name:  ${healthPractitioner.firstname} ${healthPractitioner.lastname}, Scheduled Time: ${requestSession.start_time.toString()} to ${requestSession.end_time.toString()}`);
    await mailerService.sendPractitionerCancelationEmail(healthPractitioner.email, `Patient Name:  ${patient.firstname} ${patient.lastname}, Scheduled Time: ${requestSession.start_time.toString()} to ${requestSession.end_time.toString()}`);
    await requestSession.save();
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session request cancelled successfully", requestSession);
});
PatientSession.getPatientSessions = core_1.CatchAsync.wrap(async (req, res, next) => {
    const patient_id = req.userId;
    if (!patient_id) {
        return next(new core_1.AppError("User ID is required", core_1.HttpStatus.BAD_REQUEST));
    }
    const sessions = await core_1.RequestSession.findAll({
        where: { patient_id },
        order: [["createdAt", "DESC"]],
    });
    if (!sessions || sessions.length === 0) {
        return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "No session requests found for this patient", []);
    }
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session requests retrieved successfully", sessions);
});
PatientSession.rateSession = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { rating } = req.body;
    const patient_id = req.userId;
    const { sessionId } = req.params;
    if (!rating) {
        return next(new core_1.AppError("Rating is required", core_1.HttpStatus.BAD_REQUEST));
    }
    const session = await core_1.Session.findByPk(sessionId);
    if (!session) {
        return next(new core_1.AppError("Session not found", core_1.HttpStatus.NOT_FOUND));
    }
    if (session.patient_id !== patient_id) {
        return next(new core_1.AppError("You are not authorized to rate this session", core_1.HttpStatus.UNAUTHORIZED));
    }
    if (session.status != "completed") {
        return next(new core_1.AppError("Session not completed yet", core_1.HttpStatus.UNAUTHORIZED));
    }
    session.rating = rating;
    await session.save();
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Session rated successfully", session);
});
PatientSession.downloadSessionPdf = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { id } = req.params;
    const session = await core_1.Session.findByPk(id);
    if (!session) {
        return next(new core_1.AppError("Session not found", core_1.HttpStatus.NOT_FOUND));
    }
    const pdfBuffer = await (0, services_1.generateSessionPdf)(session);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=session-${id}.pdf`);
    res.send(pdfBuffer);
});
//# sourceMappingURL=patient.session.js.map