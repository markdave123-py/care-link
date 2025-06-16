import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import * as cookieParser from "cookie-parser";

import { appRouter } from "./app.router";
import patientRouter from "../auth/routes/patient.routes";
import hpRouter from "../auth/routes/hp.routes";
import hptypeRouter from "../auth/routes/hptype.routes";
// import authRouter from "../auth/routes/auth.routes";
import userRouter from "../auth/routes/user.routes";
import {ErrorMiddleware} from "../core";
import signInRouter from "../auth/routes/signIn.routes";
export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin: ['*'], //Allow all origin
  credentials: true //Allow using cookies
}))

app.use("/api/v1", appRouter);
app.use("/api/v1/auth/patient", patientRouter);
app.use("/api/v1/auth/hp", hpRouter);
app.use("/api/v1", hptypeRouter);
app.use("/api/v1/auth", signInRouter);
app.use("/api/v1/auth", userRouter);
app.use(ErrorMiddleware.handleError);