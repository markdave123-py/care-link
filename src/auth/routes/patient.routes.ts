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
patientRouter.get('/verify-user', AuthMiddleware.verifyUserEmail, PatientController.verifiedPatient);
patientRouter.post('/login', RequestValidator.validate(loginSchema), PatientController.login);
patientRouter.post('/refresh-access-token', AuthMiddleware.authenticateUser, PatientController.login);
patientRouter.get('/:id', PatientController.getPatientById);
patientRouter.delete('/:id', PatientController.deletePatient);
patientRouter.get('/', PatientController.getAllPatients);
patientRouter.post('/logout', AuthMiddleware.authenticateUser, AuthController.logout);
patientRouter.post('/forgot-password', PatientController.forgotPassword);
patientRouter.post('/reset-password', PatientController.resetPassword);

export default patientRouter;