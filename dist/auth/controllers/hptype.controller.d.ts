import type { NextFunction, Request, Response } from "express";
declare class HpTypeController {
    static createType: (req: Request, res: Response, next: NextFunction) => void;
    static getAllTypes: (req: Request, res: Response, next: NextFunction) => void;
}
export default HpTypeController;
