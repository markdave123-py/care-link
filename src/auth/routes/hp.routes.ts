import { Router } from "express";
import HpController from "../controllers/hp.controller";
import { RequestValidator } from "../../core";
import { loginSchema, registerHpSchema } from "../validation";

const hpRouter = Router();

hpRouter.post('/register', RequestValidator.validate(registerHpSchema), HpController.register);
hpRouter.post('/login', RequestValidator.validate(loginSchema), HpController.login);

export default hpRouter;