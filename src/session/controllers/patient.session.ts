import type { Response, NextFunction } from "express";
// import Send from "../../auth/utils/response.utils";
import { RequestSession, Patient, Session, HealthPractitioner, AppError, CatchAsync, responseHandler, HttpStatus, AppointmentSlot, sequelize } from "../../core";
import { assertAlignedToSlot, assertWithinWorkingHours } from "../../scheduling-sys/services/availability.service"
import type { AuthenticateRequest } from "../../auth/middlewares";
import { generateSessionPdf, MailerService } from "../services";
import { getSlotLen } from '../../auth';
import { Op } from "sequelize";
import * as dayjs from "dayjs";
import * as utcMod from "dayjs/plugin/utc";
import * as tzMod from "dayjs/plugin/timezone";
import * as isBeforeMod from "dayjs/plugin/isSameOrBefore";

const plug = <T>(m: T) => (m as any).default ?? m;

dayjs.extend(plug(utcMod));
dayjs.extend(plug(tzMod));
dayjs.extend(plug(isBeforeMod));

const mailerService = new MailerService();
const SLOT_MIN = getSlotLen();


export class PatientSession {


  //Allows a patient to request a session
  public static requestSession = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
    const { patient_symptoms, hp_id, ongoing_medication, time} = req.body;
    // const patient_id = req.userId;
    if (!patient_symptoms || !hp_id || !time) {
      return next(new AppError("All fields are required", HttpStatus.BAD_REQUEST));
    }

    const [patient, hp] = await Promise.all([
      Patient.findByPk(req.userId),
      HealthPractitioner.findByPk(hp_id),
    ]);

    if (!patient) return next(new AppError("Patient not found", HttpStatus.NOT_FOUND));
    if (!hp)      return next(new AppError("Health Practitioner not found", HttpStatus.NOT_FOUND));

    // Parse start as UTC; client should send ISO UTC returned by availability API (slot.start_ts)
    const startUtc = dayjs.utc(time);
    if (!startUtc.isValid()) {
      return next(new AppError("Invalid time format. Use ISO-8601 UTC from availability.", HttpStatus.BAD_REQUEST));
    }
    if (startUtc.isBefore(dayjs.utc())) {
      return next(new AppError("Selected time is in the past", HttpStatus.BAD_REQUEST));
    }
    try {
      assertAlignedToSlot(startUtc);
      await assertWithinWorkingHours(hp, startUtc); 
    } catch (e) {
      return next(e);
    }

    const endUtc = startUtc.add(SLOT_MIN, "minute");

    // We need a transaction to create Request Session and Appointment slot
    const t = await sequelize.transaction();
    try {
      const newRequest = await RequestSession.create({
        patient_id: req.userId,
        health_practitioner_id: hp_id,
        patient_symptoms,
        ongoing_medication,
        start_time: startUtc.toDate(),
        end_time: endUtc.toDate(),
      }, { transaction: t });

      const slot = await AppointmentSlot.create({
        hp_id,
        patient_id: req.userId,
        request_session_id: newRequest.id,
        start_ts: startUtc.toDate(),
        end_ts: endUtc.toDate(),
        status: "pending",
      }, { transaction: t });

      await t.commit();

      (async () => {
        try {
          await mailerService.sendSessionRequestAlert(
            hp.email,
            patient.firstname,
            startUtc.tz(hp.timezone || "Africa/Lagos").format("YYYY-MM-DD HH:mm")
          );
        } catch { }
      })();

      return responseHandler.success(res, HttpStatus.OK, "Session request created successfully", {
        request: newRequest,
        appointment_slot: slot,
      });
    } catch (err: any) {
      await t.rollback();

      // Map common DB constraint errors to friendly messages
      // Exclusion conflict (overlap): 23P01; Check constraint: 23514
      const pgCode = err?.original?.code;
      const constraint = err?.original?.constraint;

      if (pgCode === "23P01" && constraint === "appointment_no_overlap") {
        return next(new AppError("That slot was just taken. Please pick another time.", HttpStatus.CONFLICT));
      }
      if (pgCode === "23514" && constraint === "chk_fixed_length") {
        return next(new AppError("Invalid slot length; must be exactly 30 minutes.", HttpStatus.BAD_REQUEST));
      }

      return next(new AppError("Failed to create session request", HttpStatus.INTERNAL_SERVER_ERROR));
    }

  });


// Allows a patient to cancel a session request
public static cancelRequest = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
  const patient_id = req.userId;
  const { requestSession_id } = req.params;

  const requestSession = await RequestSession.findByPk(requestSession_id);
  if (!requestSession) return next(new AppError("Session request not found", HttpStatus.NOT_FOUND));
  if (requestSession.patient_id !== patient_id) {
    return next(new AppError("You are not authorized to cancel this session request", HttpStatus.UNAUTHORIZED));
  }
  if (requestSession.status !== "pending") {
    return next(new AppError("Only pending requests can be cancelled", HttpStatus.CONFLICT));
  }

  // Load participants after we know the session exists
  const [patient, healthPractitioner] = await Promise.all([
    Patient.findByPk(patient_id),
    HealthPractitioner.findByPk(requestSession.health_practitioner_id),
  ]);
  if (!patient || !healthPractitioner) {
    return next(new AppError("Health Practitioner or patient not found", HttpStatus.NOT_FOUND));
  }

  // Transaction: mark RequestSession + linked AppointmentSlot as cancelled
  const t = await sequelize.transaction();
  try {
    // optimistic guard—update only if still pending
    const [affected] = await RequestSession.update(
      { status: "cancelled" },
      { where: { id: requestSession_id, status: "pending" }, transaction: t }
    );
    if (affected === 0) {
      await t.rollback();
      return next(new AppError("Request is no longer pending", HttpStatus.CONFLICT));
    }

    // Cancel the corresponding appointment slot (if any)
    await AppointmentSlot.update(
      { status: "cancelled" },
      { where: { request_session_id: requestSession_id, status: { [Op.in]: ["pending", "accepted"] } }, transaction: t }
    );

    await t.commit();

    // Fire and forget emails, so we do not block response
    (async () => {
      try {
        const when = `${requestSession.start_time.toISOString()} – ${requestSession.end_time.toISOString()}`; // or format in tz
        await mailerService.sendPatientCancelationEmail(
          patient.email,
          `Health Practitioner: ${healthPractitioner.firstname} ${healthPractitioner.lastname}, Scheduled Time: ${when}`
        );
        await mailerService.sendPractitionerCancelationEmail(
          healthPractitioner.email,
          `Patient: ${patient.firstname} ${patient.lastname}, Scheduled Time: ${when}`
        );
      } catch { /* swallow */ }
    })();

    // Refresh instance status for response (optional)
    requestSession.status = "cancelled";
    return responseHandler.success(res, HttpStatus.OK, "Session request cancelled successfully", requestSession);
  } catch (err) {
    await t.rollback();
    return next(new AppError("Failed to cancel session request", HttpStatus.INTERNAL_SERVER_ERROR));
  }
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

  // public static downloadPrescription = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
  //   const { sessionId } = req.params;

  //   const session = await Session.findByPk(sessionId);
  //   if (!session) {
  //     return next(new AppError("Session not found", HttpStatus.NOT_FOUND));
  //   }

  //   if (session.patient_id !== req.userId) {
  //     return next(new AppError("You are not authorized to download this prescription", HttpStatus.UNAUTHORIZED));
  //   }

  //   // generatePrescriptionPDF(session, res);
  // })



  public static downloadSessionPdf = CatchAsync.wrap(async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const session = await Session.findByPk(id);
    if (!session) {
      return next(new AppError("Session not found", HttpStatus.NOT_FOUND));
    }

    const pdfBuffer = await generateSessionPdf(session);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=session-${id}.pdf`);
    res.send(pdfBuffer);
});

}

// export const patientSession = new RequestSession();
