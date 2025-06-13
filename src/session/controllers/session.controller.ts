import { Request, Response } from "express"
import { responseHandler } from "../../core";
import {Session} from "../../core";
import { AppError } from "../../core";
export class SessionController{
    static requestSession = async (req: Request, res: Response) => {
        const {} = req.body;
    } 
}