import type { Request, Response } from "express";
import { CatchAsync, HPType } from "../../core";
import Send from "../utils/response.utils";

class HpTypeController {
	static createType = CatchAsync.wrap(async (req: Request, res: Response) => {
		const { profession } = req.body;

		const hptype = await HPType.create({
			name: profession,
		});

		return Send.success(
			res,
			{
				id: hptype.id,
				name: hptype.name,
			},
			"Created a new hptype successfully"
		);
	});
}

export default HpTypeController;
