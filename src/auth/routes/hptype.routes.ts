import { Router } from "express";
import HpTypeController from "../controllers/hptype.controller";

const hptypeRouter = Router();

hptypeRouter.post("/type", HpTypeController.createType);

export default hptypeRouter;