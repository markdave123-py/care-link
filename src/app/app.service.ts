import * as express from "express";
import { appRouter } from "./app.router";

export const app = express();

app.use(express.json());
app.use("/api/v1", appRouter);