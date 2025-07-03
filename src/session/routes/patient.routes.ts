import {Router} from "express";
import { PatientSession} from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";
export const patientSessRouter = Router();
patientSessRouter.use(AuthMiddleware.authenticateUser);
patientSessRouter.post("/request", PatientSession.requestSession);
patientSessRouter.get("/", PatientSession.getPatientSessions);
patientSessRouter.patch("/cancel", PatientSession.cancelRequest);