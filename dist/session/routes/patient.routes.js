"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientSessRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../auth/middlewares/auth.middleware");
exports.patientSessRouter = (0, express_1.Router)();
exports.patientSessRouter.use(auth_middleware_1.default.authenticateUser);
exports.patientSessRouter.post("/request", controllers_1.PatientSession.requestSession);
exports.patientSessRouter.get("/", controllers_1.PatientSession.getPatientSessions);
exports.patientSessRouter.patch("/:requestSession_id/cancel", controllers_1.PatientSession.cancelRequest);
exports.patientSessRouter.get("/:id/download-session", controllers_1.PatientSession.downloadSessionPdf);
exports.patientSessRouter.patch("/:id/rate", controllers_1.PatientSession.rateSession);
//# sourceMappingURL=patient.routes.js.map