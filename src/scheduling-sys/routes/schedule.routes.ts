import { Router } from "express";
import { HpSchedule } from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";

export const HpScheduleRouter = Router();

HpScheduleRouter.use(AuthMiddleware.authenticateUser);

HpScheduleRouter.put('/hp/working-hours', HpSchedule.upsertSchedule);
HpScheduleRouter.get('/:hp_id/working-hours', HpSchedule.getSchedule);