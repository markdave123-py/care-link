import type { Request, Response } from "express";
import { Router } from "express";
import { HttpStatus } from "../core";
// import { responseHandler } from "../core";
import {responseHandler} from "../core";
export const appRouter = Router();

appRouter.get("/health", (_: Request, res: Response) => {
  return responseHandler.success(res, HttpStatus.OK, "Server is running");
});