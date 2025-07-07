import type { Response, NextFunction } from "express";
import Rag from "../services/rag.service";
export declare class SmartSys {
    private readonly rag;
    constructor(rag: Rag);
    getHpBySymptom: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
