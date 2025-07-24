import {Router} from "express";
import { SmartSys } from '../controllers';
import Rag from '../services/rag.service';

export const SmartRouter = Router();

const ragService = new Rag()
const smartSys = new SmartSys(ragService)

SmartRouter.post("/hp-by-symptom", smartSys.getHpBySymptom);