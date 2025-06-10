// import type { Response } from "express";
// import type { AuthenticateRequest } from "../middlewares/auth.middleware";
// import Send from "../utils/response.utils";
// import prisma from "../utils/db";

// class UserController {
// 	static getUser = async (req: AuthenticateRequest, res: Response) => {
// 		try {
// 			const userId = req.userId;
// 			console.log(userId);

// 			const user = await prisma.user.findUnique({
// 				where: { id: userId },
// 				select: {
// 					id: true,
// 					username: true,
// 					email: true,
// 					createdAt: true,
// 					updatedAt: true,
// 				},
// 			});

// 			if (!user) {
// 				return Send.notFound(res, { message: "User not found" });
// 			}

// 			return Send.success(res, { message: "User found successfully" });
// 		} catch (err) {
// 			console.error("Error getting user: ", err);
// 			return Send.error(res, { message: "Error getting user" });
// 		}
// 	};
// }

// export default UserController;
