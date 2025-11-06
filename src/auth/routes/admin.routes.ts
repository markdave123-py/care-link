import { Router } from "express";
import { AdminController } from "../controllers";
import AuthMiddleware from "../middlewares/auth.middleware";
import { RequestValidator } from "../../core";
import { loginSchema } from "../validation";

const AdminRouter = Router();

// Google & Auth
AdminRouter.get('/google', AdminController.initializeGoogleAuth);
AdminRouter.get('/google/callback', AdminController.getAdminToken);
AdminRouter.post('/register', AdminController.register);
AdminRouter.post('/login', RequestValidator.validate(loginSchema), AdminController.login);
AdminRouter.post('/refresh-access-token', AuthMiddleware.authenticateUser, AdminController.refreshAccessToken);
AdminRouter.post('/request-admin', AuthMiddleware.authenticateAdmin, AdminController.requestAdmin);
AdminRouter.post('/invite-admin', AdminController.inviteAdmin);
AdminRouter.post('/logout', AdminController.logout);
AdminRouter.post('/forgot-password', AdminController.forgotPassword);
AdminRouter.post('/reset-password', AdminController.resetPassword);

// Listing routes
AdminRouter.get('/all-patients', AdminController.getAllPatients);
AdminRouter.get('/all-hp', AdminController.getAllPractitioners);

// Search
AdminRouter.get('/patients/search', AdminController.searchPatientByEmailOrName);
AdminRouter.get('/hp/search', AdminController.searchPractitionerByEmailOrName);

// Session routes 
AdminRouter.get('/session', AdminController.getSessions);
AdminRouter.get('/hp/:hp_id/sessions', AdminController.getHPSessions);
AdminRouter.get('/patient/:patient_id/sessions', AdminController.getPatientSessions);

// Entity lookup routes 
AdminRouter.get('/admin/:id', AdminController.getAdminById);
AdminRouter.get('/patient/:id', AdminController.getPatientById);
AdminRouter.get('/hp/:id', AdminController.getPractitionerById);

// Delete
AdminRouter.delete('/patient/:id', AdminController.deletePatient);
AdminRouter.delete('/hp/:id', AdminController.deletePractitioner);
AdminRouter.delete('/admin/:id', AdminController.deleteAdmin);

// List all Admins
AdminRouter.get('/', AdminController.getAllAdmins);



export default AdminRouter;