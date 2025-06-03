import type { Request, Response } from "express";
import { Router } from "express";
import { HttpStatus } from "../core/utils/statusCodes";
import { responseHandler } from "../core/utils/responseHandler";
export const appRouter = Router();

appRouter.get("/health", (_: Request, res: Response) => {
  return responseHandler.success(res, HttpStatus.OK, "Server is running");
});