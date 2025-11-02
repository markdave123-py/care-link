import {Router} from "express";
import { HpSession} from "../controllers";
import AuthMiddleware from "../../auth/middlewares/auth.middleware";
export const HpSessRouter = Router();

// This router is for health practitioner session related routes
HpSessRouter.use(AuthMiddleware.authenticateUser);

HpSessRouter.post("/:sessionId/start-session", HpSession.startSession);

HpSessRouter.patch("/:sessionId/end-session", HpSession.endSession);

HpSessRouter.get("/:hp_id/request-session", HpSession.getRequestsByID);

HpSessRouter.patch("/:request_session_id/accept-request", HpSession.acceptRequest);

HpSessRouter.patch("/:request_session_id/decline-request", HpSession.declineRequest);

HpSessRouter.patch("/:sessionId/update-session", HpSession.updateSessionDetails);

HpSessRouter.post("/:parentSessionId/create-followup", HpSession.createFollowUpSession);
