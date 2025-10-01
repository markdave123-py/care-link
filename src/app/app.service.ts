import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import * as cookieParser from "cookie-parser";

import { appRouter } from "./app.router";
import patientRouter from "../auth/routes/patient.routes";
import hpRouter from "../auth/routes/hp.routes";
import hptypeRouter from "../auth/routes/hptype.routes";
import { patientSessRouter, HpSessRouter } from "../session";
import {ErrorMiddleware} from "../core";
import AdminRouter from "../auth/routes/admin.routes";
import { SmartRouter } from "../smart-sys/routes";
import { ScheduleRouter } from "src/scheduling-sys";
import { corsOptions } from "src/auth";

export const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));  

app.use("/api/v1", appRouter);
app.use("/api/v1/auth/admin", AdminRouter);
app.use("/api/v1/auth/patient", patientRouter);
app.use("/api/v1/auth/hp", hpRouter);
app.use("/api/v1/hptype", hptypeRouter);
app.use("/api/v1/patient-sessions", patientSessRouter);
app.use("/api/v1/hp-sessions", HpSessRouter);
app.use("/api/v1/smart-sys", SmartRouter);
app.use("/api/v1/schedule", ScheduleRouter)
app.use(ErrorMiddleware.handleError);