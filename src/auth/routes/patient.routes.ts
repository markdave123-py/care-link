import { Router } from "express";
import { getToken, initializeGoogleAuth } from "../controllers/patient.controller";
import PatientController from "../controllers/patient.controller";

const patientRouter = Router();

patientRouter.get('/google', initializeGoogleAuth);
patientRouter.get('/google/callback', getToken);
patientRouter.post('/register', PatientController.register);
patientRouter.post('/login', PatientController.login);

export default patientRouter;