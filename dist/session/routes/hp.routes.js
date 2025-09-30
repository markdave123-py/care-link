"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HpSessRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../auth/middlewares/auth.middleware");
exports.HpSessRouter = (0, express_1.Router)();
exports.HpSessRouter.use(auth_middleware_1.default.authenticateUser);
exports.HpSessRouter.post("/:sessionId/start-session", controllers_1.HpSession.startSession);
exports.HpSessRouter.patch("/:sessionId/end-session", controllers_1.HpSession.endSession);
exports.HpSessRouter.patch("/:request_session_id/accept-request", controllers_1.HpSession.acceptRequest);
exports.HpSessRouter.patch("/:request_session_id/decline-request", controllers_1.HpSession.declineRequest);
exports.HpSessRouter.patch("/:sessionId/update-session", controllers_1.HpSession.updateSessionDetails);
exports.HpSessRouter.post("/:parentSessionId/create-followup", controllers_1.HpSession.createFollowUpSession);
//# sourceMappingURL=hp.routes.js.map