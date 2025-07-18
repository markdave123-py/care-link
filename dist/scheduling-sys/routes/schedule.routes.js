"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../auth/middlewares/auth.middleware");
exports.ScheduleRouter = (0, express_1.Router)();
exports.ScheduleRouter.use(auth_middleware_1.default.authenticateUser);
exports.ScheduleRouter.put('/hp/working-hours', controllers_1.HpSchedule.upsertSchedule);
exports.ScheduleRouter.get('/:hp_id/working-hours', controllers_1.HpSchedule.getSchedule);
//# sourceMappingURL=schedule.routes.js.map