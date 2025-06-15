import { Router } from "express";
import { getToken, initializeGoogleAuth } from "../controllers/patient.controller";
import PatientController from "../controllers/patient.controller";
import { RequestValidator } from "../../core";
import { loginSchema, registerPatientSchema } from "../validation";

const patientRouter = Router();

patientRouter.get('/google', initializeGoogleAuth);
patientRouter.get('/google/callback', getToken);
patientRouter.post('/register', RequestValidator.validate(registerPatientSchema), PatientController.register);
patientRouter.post('/login', RequestValidator.validate(loginSchema), PatientController.login);

export default patientRouter;