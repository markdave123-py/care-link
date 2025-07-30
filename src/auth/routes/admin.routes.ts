import { Router } from "express";
import { AdminController } from "../controllers";
import AuthMiddleware from "../middlewares/auth.middleware";
import { RequestValidator } from "../../core";
import { loginSchema } from "../validation";

const AdminRouter = Router();

AdminRouter.get('/google', AdminController.initializeGoogleAuth);
AdminRouter.get('/google/callback', AdminController.getAdminToken);
AdminRouter.post('/register', AdminController.register);
AdminRouter.post('/login', RequestValidator.validate(loginSchema), AdminController.login);
AdminRouter.post('/refresh-access-token', AuthMiddleware.authenticateUser, AdminController.refreshAccessToken);
AdminRouter.post('/request-admin', AuthMiddleware.authenticateAdmin, AdminController.requestAdmin);
AdminRouter.post('/invite-admin', AdminController.inviteAdmin);
AdminRouter.post('/logout', AdminController.logout);
AdminRouter.get('/:id', AdminController.getAdminById);
AdminRouter.delete('/:id', AdminController.deleteAdmin);
AdminRouter.get('/', AdminController.getAllAdmins);
AdminRouter.post('/forgot-password', AdminController.forgotPassword);
AdminRouter.post('/reset-password', AdminController.resetPassword);

export default AdminRouter;