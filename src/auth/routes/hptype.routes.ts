import { Router } from "express";
import HpTypeController from "../controllers/hptype.controller";
import { RequestValidator } from "../../core";
import { hpTypeSchema } from "../validation";

const hptypeRouter = Router();

hptypeRouter.post("/type", RequestValidator.validate(hpTypeSchema), HpTypeController.createType);

export default hptypeRouter;