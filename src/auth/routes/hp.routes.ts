import { Router } from "express";
import HpController from "../controllers/hp.controller";
import { RequestValidator } from "../../core";
import { loginSchema, registerHpSchema } from "../validation";
import AuthMiddleware from "../middlewares/auth.middleware";
import { uploadFile } from "../../core/middlewares/upload";

const hpRouter = Router();

hpRouter.get('/google', HpController.initializeGoogleAuth);
hpRouter.get('/google/callback', HpController.getPractitionerToken);
hpRouter.post('/register', uploadFile, RequestValidator.validate(registerHpSchema), HpController.register);
hpRouter.get('/verify-user', AuthMiddleware.verifyUserEmail, HpController.verifiedHealthPractitioner);
hpRouter.post('/login', RequestValidator.validate(loginSchema), HpController.login);
hpRouter.post('/refresh-access-token', AuthMiddleware.authenticateUser, HpController.refreshAccessToken);
hpRouter.get('/:id', HpController.getPractitionerById);
hpRouter.delete('/:id', HpController.deletePractitioner);
hpRouter.get('/', HpController.getAllPractitioners);
hpRouter.post('/logout', AuthMiddleware.authenticateUser, HpController.logout);
hpRouter.post('/forgot-password', HpController.forgotPassword);
hpRouter.post('/reset-password', HpController.resetPassword);

export default hpRouter;