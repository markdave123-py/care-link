import { Router } from "express";
import HpController from "../controllers/hp.controller";
import { RequestValidator } from "../../core";
import { loginSchema, registerHpSchema } from "../validation";
import AuthMiddleware from "../middlewares/auth.middleware";
import AuthController from "../controllers/auth.controller";

const hpRouter = Router();

hpRouter.post('/register', RequestValidator.validate(registerHpSchema), HpController.register);
hpRouter.post('/login', RequestValidator.validate(loginSchema), HpController.login);
hpRouter.post('/logout', AuthMiddleware.authenticateUser, AuthController.logout);

export default hpRouter;