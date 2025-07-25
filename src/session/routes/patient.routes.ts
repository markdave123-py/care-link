import {Router} from "express";
import { PatientSession} from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";
export const patientSessRouter = Router();

// This router is for patient session related routes
patientSessRouter.use(AuthMiddleware.authenticateUser);

patientSessRouter.post("/request", PatientSession.requestSession);

patientSessRouter.get("/", PatientSession.getPatientSessions);

patientSessRouter.patch("/:requestSession_id/cancel", PatientSession.cancelRequest);

patientSessRouter.get("/:id/download-session", PatientSession.downloadSessionPdf);

patientSessRouter.patch("/:id/rate", PatientSession.rateSession);