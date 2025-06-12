import { Router } from "express";
import UserController from "../controllers/user.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get('/info', AuthMiddleware.authenticateUser, UserController.getUser);

export default userRouter;