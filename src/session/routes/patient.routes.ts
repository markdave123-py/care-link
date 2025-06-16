import {Router} from "express";
import { PatientSession} from "../controllers";
export const patientSession = Router();

patientSession.post("/request", PatientSession.requestSession);
patientSession.get("/", PatientSession.getPatientSessions);
patientSession.patch("/cancel", PatientSession.cancelRequest);