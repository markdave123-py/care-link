import type { NextFunction, Request, Response } from "express";
import { AppError, HPType, CatchAsync} from "../../core";
// import { CatchAsync } from "../../core/utils";
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

	static getAllTypes = CatchAsync.wrap(
		async (req: Request, res: Response, next: NextFunction) => {
			const allTypes = await HPType.findAll();

			if (!allTypes) {
				return next(new AppError("No Practitioner Type seen", 404));
			}
			
			return Send.success(
				res,
				"All Health Practitioner Types",
				[ ...allTypes ]
			)
		}
	)
}

export default HpTypeController;
