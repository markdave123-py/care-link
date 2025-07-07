import type { Response } from "express";
import type { AuthenticateRequest } from "../middlewares/auth.middleware";
declare class UserController {
    static getUser: (req: AuthenticateRequest, res: Response) => Promise<void>;
}
export default UserController;
