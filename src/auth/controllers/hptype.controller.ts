import type { NextFunction, Request, Response } from "express";
import { AppError, CatchAsync, HPType } from "../../core";
import Send from "../utils/response.utils";
import Rag  from "../../smart-sys/services/rag.service";

const ragService = new Rag()
class HpTypeController {
	static createType = CatchAsync.wrap(async (req: Request, res: Response, next: NextFunction) => {
		const { profession } = req.body;

		const exists = await HPType.findOne({
			where: {name: profession}
		})

		if (exists) {
			return next(new AppError("Health practitioner Type already exists", 400))
		}

		const embedding = await ragService.getEmbedding(profession)

		const hptype = await HPType.create({
			name: profession,
			embedding
		});

		return Send.success(
			res,
			"Created a new hptype successfully",
			{
				id: hptype.id,
				name: hptype.name,
			},
		);
	});
}

export default HpTypeController;
