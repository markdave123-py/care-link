import { Router } from "express";
import { initializeGoogleAuth } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.get('/google', initializeGoogleAuth);