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

export default AdminRouter;