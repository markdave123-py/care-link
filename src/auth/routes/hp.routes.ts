import { Router } from "express";
import HpController from "../controllers/hp.controller";

const hpRouter = Router();

hpRouter.post('/register', HpController.register);
hpRouter.post('/login', HpController.login);

export default hpRouter;