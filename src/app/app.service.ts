import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import * as cookieParser from "cookie-parser";

import { appRouter } from "./app.router";
import patientRouter from "../auth/routes/auth.routes";
// import authRouter from "../auth/routes/auth.routes";
// import userRouter from "../auth/routes/user.routes";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin: ['*'], //Allow all origin
  credentials: true //Allow using cookies
}))

app.use("/api/v1", appRouter);
app.use("/api/v1/auth", patientRouter);
// app.use("/api/v1/user", userRouter);