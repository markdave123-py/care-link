import { Router } from "express";
import PatientController from "../controllers/patient.controller";
import { RequestValidator } from "../../core";
import { loginSchema, registerPatientSchema } from "../validation";
import AuthController from "../controllers/auth.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const patientRouter = Router();

patientRouter.get('/google', AuthController.initializeGoogleAuth);
patientRouter.get('/google/callback', AuthController.getToken);
patientRouter.post('/register', RequestValidator.validate(registerPatientSchema), PatientController.register);
patientRouter.post('/login', RequestValidator.validate(loginSchema), PatientController.login);
patientRouter.post('/logout', AuthMiddleware.authenticateUser, AuthController.logout);

export default patientRouter;