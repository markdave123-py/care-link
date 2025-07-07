import {Router} from "express";
import { HpSession} from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";


export const HpRouter = Router();
HpRouter.use(AuthMiddleware.authenticateUser);
HpRouter.patch("/start-session", HpSession.startSession);
HpRouter.patch("/end-session", HpSession.endSession);
HpRouter.patch("/update-sesssion", HpSession.updateSessionDetails);