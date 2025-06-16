import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const signInRouter = Router();

signInRouter.get("/google", AuthController.initializeGoogleAuth);
signInRouter.get("/google/callback", AuthController.getToken);

export default signInRouter;