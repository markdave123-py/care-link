import { Router } from "express";
import UserController from "../controllers/user.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
// import AuthController from "../controllers/auth.controller";

const userRouter = Router();

userRouter.get('/info', AuthMiddleware.authenticateUser, UserController.getUser);
// userRouter.post('/refresh-token', AuthMiddleware.refreshTokenValidation, AuthController.refreshToken);

export default userRouter;