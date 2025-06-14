import type { Request, Response } from "express";
import { HPType } from "../../core";
import Send from "../utils/response.utils";

class HpTypeController {
    static createType = async (req: Request, res: Response) => {
        try {
            const { profession } = req.body;

            const hptype = await HPType.create({
                name: profession,
            })

            return Send.success(res, {
                id: hptype.id,
                name: hptype.name
            }, "Created a new hptype successfully")
        } catch(err) {
            console.log("Error creating hp type: ", err);
        }
    }
}

export default HpTypeController;