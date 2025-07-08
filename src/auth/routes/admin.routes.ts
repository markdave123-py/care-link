import { Router } from "express";
import { AdminController } from "../controllers";
import AuthMiddleware from "../middlewares/auth.middleware";

const AdminRouter = Router();

AdminRouter.post('/register', AdminController.register);
AdminRouter.post('/login', AdminController.login);
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