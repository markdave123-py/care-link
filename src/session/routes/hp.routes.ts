import {Router} from "express";
import { HpRouter} from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";
export const HpRouter = Router();
HpRouter.use(AuthMiddleware.authenticateUser);
HpRouter.patch("/start-session", HpRouter.startSession);
HpRouter.patch("/end-session", HpRouter.endSession);
HpRouter.patch("/update-sesssion", HpRouter.updateSessionDetails);