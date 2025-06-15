import {Router} from "express";
import { PatientSession } from "../controllers";

export const patientRouter = Router();

patientRouter.post("/", PatientSession.requestSession);