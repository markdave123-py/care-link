import { Router } from "express";
import { getToken, initializeGoogleAuth } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get('/google', initializeGoogleAuth);
authRouter.get('/google/callback', getToken);

export default authRouter;