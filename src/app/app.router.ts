import type { Request, Response } from "express";
import { Router } from "express";

export const appRouter = Router();

appRouter.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ // change tgo HTTP.OK
    message: "App up",
    version: "1.0",
  });
});