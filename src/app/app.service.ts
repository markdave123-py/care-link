import * as express from "express";
import * as session from 'express-session';

import { appRouter } from "./app.router";
import authRouter from "./auth/routes/auth.routes";

export const app = express();

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use("/api/v1", appRouter);
app.use("/api/v1/auth", authRouter);