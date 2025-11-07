import { Router } from "express";
import PatientController from "../controllers/patient.controller";
import { RequestValidator } from "../../core";
import { loginSchema, registerPatientSchema } from "../validation";
import AuthController from "../controllers/auth.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const patientRouter = Router();

patientRouter.get('/google', PatientController.initializeGoogleAuth);
patientRouter.get('/google/callback', PatientController.getPatientToken);
patientRouter.post('/register', RequestValidator.validate(registerPatientSchema), PatientController.register);
patientRouter.post('/login', RequestValidator.validate(loginSchema), PatientController.login);
patientRouter.get('/verify-user', AuthMiddleware.verifyUserEmail, PatientController.verifiedPatient);
patientRouter.post('/refresh-access-token', AuthMiddleware.authenticatePatient, PatientController.refreshAccessToken);
patientRouter.post('/forgot-password', AuthMiddleware.authenticatePatient, PatientController.forgotPassword);
patientRouter.post('/reset-password', AuthMiddleware.authenticatePatient, PatientController.resetPassword);
patientRouter.post('/logout', AuthMiddleware.authenticatePatient, AuthController.logout);
patientRouter.delete('/:id', PatientController.deletePatient);

// For Admin
patientRouter.get('/:id', PatientController.getPatientById);

export default patientRouter;