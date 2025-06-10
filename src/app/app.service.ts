import * as express from "express";
import * as cors from "cors";
import *as morgan from "morgan";

import { appRouter } from "./app.router";
import authRouter from "../auth/routes/auth.routes";
import userRouter from "../auth/routes/user.routes";
import { ErrorMiddleware } from "../core";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
  origin: ['*'], //Allow all origin
  credentials: true //Allow using cookies
}))

app.use("/api/v1", appRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use(ErrorMiddleware.handleError);