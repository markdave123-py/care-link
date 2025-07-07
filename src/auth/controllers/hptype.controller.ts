import type { Request, Response } from "express";
import { CatchAsync, HPType } from "../../core";
import Send from "../utils/response.utils";
import Rag  from "../../smart-sys/services/rag.service";

const ragService = new Rag()
class HpTypeController {
	static createType = CatchAsync.wrap(async (req: Request, res: Response) => {
		const { profession } = req.body;

		let embedding = await ragService.getEmbedding(profession)

		const hptype = await HPType.create({
			name: profession,
			embedding
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
