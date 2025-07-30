import { Router } from "express";
import { HpSchedule } from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";

export const ScheduleRouter = Router();

// ScheduleRouter.use(AuthMiddleware.authenticateUser);

ScheduleRouter.put('/hp/working-hours', HpSchedule.upsertSchedule);
ScheduleRouter.get('/:hp_id/working-hours', HpSchedule.getSchedule);