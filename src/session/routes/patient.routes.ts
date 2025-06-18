import {Router} from "express";
import { PatientSession} from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";
export const patientSession = Router();
patientSession.use(AuthMiddleware.authenticateUser);
patientSession.post("/request", PatientSession.requestSession);
patientSession.get("/", PatientSession.getPatientSessions);
patientSession.patch("/cancel", PatientSession.cancelRequest);