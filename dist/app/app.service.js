"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app_router_1 = require("./app.router");
const patient_routes_1 = require("../auth/routes/patient.routes");
const hp_routes_1 = require("../auth/routes/hp.routes");
const hptype_routes_1 = require("../auth/routes/hptype.routes");
const user_routes_1 = require("../auth/routes/user.routes");
const session_1 = require("../session");
const core_1 = require("../core");
const admin_routes_1 = require("../auth/routes/admin.routes");
const routes_1 = require("../smart-sys/routes");
exports.app = express();
exports.app.use(express.json());
exports.app.use(cookieParser());
exports.app.use(morgan("dev"));
exports.app.use(cors({
    origin: ['*'],
    credentials: true
}));
exports.app.use("/api/v1", app_router_1.appRouter);
exports.app.use("/api/v1/auth/admin", admin_routes_1.default);
exports.app.use("/api/v1/auth/patient", patient_routes_1.default);
exports.app.use("/api/v1/auth/hp", hp_routes_1.default);
exports.app.use("/api/v1", hptype_routes_1.default);
exports.app.use("/api/v1/auth", user_routes_1.default);
exports.app.use("/api/v1/patient-sessions", session_1.patientSessRouter);
exports.app.use("/api/v1/hp-sessions", session_1.HpSessRouter);
exports.app.use("/api/v1/smart-sys", routes_1.SmartRouter);
exports.app.use(core_1.ErrorMiddleware.handleError);
//# sourceMappingURL=app.service.js.map