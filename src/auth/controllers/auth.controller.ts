// import type { Request, Response } from "express";
// import * as bcrypt from "bcrypt";
// import * as jwt from "jsonwebtoken";
// import { buildUrl } from "../utils/google";
// import { google } from "../config/oauth";
// import { env } from "../config/env";
// import Send from "../utils/response.utils";
// import prisma from "../utils/db";
// import type { AuthenticateRequest } from "../middlewares/auth.middleware";

// class AuthController {
// 	static login = async (req: Request, res: Response) => {
// 		const { email, password } = req.body;

// 		try {
// 			const user = await prisma.user.findUnique({
// 				where: { email },
// 			});
// 			if (!user) {
// 				return Send.error(res, null, "Invalid credentials");
// 			}

// 			const isPasswordValid = await bcrypt.compare(password, user.password);
// 			if (!isPasswordValid) {
// 				return Send.error(res, null, "Incorrect password");
// 			}
      
// 			const accessToken = jwt.sign(
//         {userId: user.id},
//         env.JWT_SECRET,
//         { expiresIn: "15m" }
//       );

// 			const refreshToken = jwt.sign(
// 				{ userId: user.id },
// 				env.JWT_REFRESH_TOKEN_SECRET,
//         { expiresIn: "1d" }
// 			);

// 			await prisma.user.update({
// 				where: { email },
// 				data: { refreshToken },
// 			});

// 			res.cookie("accessToken", accessToken, {
// 				httpOnly: true,
// 				secure: process.env.NODE_ENV === "production",
// 				maxAge: 15 * 60 * 1000,
// 				sameSite: "strict",
// 			});
// 			res.cookie("refreshToken", refreshToken, {
// 				httpOnly: true,
// 				secure: process.env.NODE_ENV === "production",
// 				maxAge: 24 * 60 * 60 * 1000,
// 				sameSite: "strict",
// 			});

// 			return Send.success(res, {
// 				id: user.id,
// 				username: user.username,
// 				email: user.email,
// 				createdAt: user.createdAt,
// 				UpdatedAt: user.updatedAt,
// 			});
// 		} catch (err) {
// 			console.error("Error logging in: ", err);
// 			return Send.error(res, null, "Error logging in");
// 		}
// 	};

// 	static register = async (req: Request, res: Response) => {
// 		const { username, email, password } = req.body;

// 		try {
// 			const existinguser = await prisma.user.findUnique({
// 				where: { email },
// 			});

// 			if (existinguser) {
// 				return Send.error(res, null, "Email already in use");
// 			}

// 			const hashedpassword = await bcrypt.hash(password, 10);

// 			const newUser = await prisma.user.create({
// 				data: {
// 					username,
// 					email,
// 					password: hashedpassword,
// 				},
// 			});

// 			return Send.success(
// 				res,
// 				{
// 					id: newUser.id,
// 					username: newUser.username,
// 					email: newUser.email,
// 				},
// 				"User created successfully"
// 			);
// 		} catch (err) {
// 			console.error("Error registering user: ", err);
// 			return Send.error(res, null, "Registration failed");
// 		}
// 	};

//   static logout = async (req: AuthenticateRequest, res: Response) => {
//     try{
//       const userId = req.userId;
//       if(userId) {
//         await prisma.user.update({
//           where: { id: userId },
//           data: { refreshToken: null }
//         })
//       }

//       res.clearCookie("accessToken");
//       res.clearCookie("refreshToken");

//       return Send.success(res, null, "Logged out successfully")
//     } catch(err) {
//       console.error("Error loging out: ",err);
//       return Send.error(res, null, "Error logging out")
//     }
//   };

//   static refreshToken = async (req: AuthenticateRequest, res: Response) => {
//     try {
//       const userId = req.userId;
//       const refreshToken = req.cookies.accessToken;

//       const user = await prisma.user.findUnique({
//         where: { id: userId }
//       });

//       if (!user || !refreshToken) {
//         return Send.unauthorized(res, "Refresh Token not found")
//       }

//       if (user.refreshToken !== refreshToken) {
//         return Send.unauthorized(res, { message: "Invalid Refresh Token" })
//       }

//       const newAccessToken = jwt.sign(
//         { userId: user.id },
//         env.JWT_EXPIRES_IN,
//         { expiresIn: 15 * 60 * 1000 }
//       )

//       res.cookie("accessToken", newAccessToken, {
//         httpOnly: true,
//         secure: env.NODE_ENV === "production",
//         maxAge: 15 * 60 * 1000,
//         sameSite: "strict"
//       })

//       return Send.success(res, { message: "Access Token refreshed successfully" })
      
//     } catch(err) {
//       console.error("Error refreshing token: ", err);
//       return Send.error(res, null, "Error generating accessToken")
//     }
//   };
// }

// export const initializeGoogleAuth = async (_: Request, res: Response) => {
// 	const consent_screen = buildUrl(google);
// 	res.redirect(consent_screen);
// };

// export const getToken = async (req: Request, res: Response): Promise<void> => {
// 	console.log(req.query);

// 	const { code } = req.query;

// 	const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

// 	if (
// 		!env.GOOGLE_CLIENT_ID ||
// 		!env.GOOGLE_CLIENT_SECRET ||
// 		!env.GOOGLE_REDIRECT_URI ||
// 		!code
// 	) {
// 		res.status(400).json({ error: "Missing required OAuth parameters" });
// 		return;
// 	}

// 	try {
// 		const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/x-www-form-urlencoded",
// 			},
// 			body: new URLSearchParams({
// 				client_id: env.GOOGLE_CLIENT_ID,
// 				client_secret: env.GOOGLE_CLIENT_SECRET,
// 				code: code as string,
// 				grant_type: "authorization_code",
// 				redirect_uri: env.GOOGLE_REDIRECT_URI,
// 			}),
// 		});

// 		if (!response.ok) {
// 			// Get error details from the response
// 			const errorText = await response.text();
// 			console.error("Token exchange failed:", errorText);
// 			res.status(400).json({
// 				error: "Token exchange failed",
// 				details: errorText,
// 			});
// 			return;
// 		}

// 		const access_token_data = await response.json();
// 		console.log(access_token_data);

// 		const { id_token } = access_token_data;

// 		const token_info_response = await fetch(
// 			`${env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
// 		);

// 		res.json({
// 			success: true,
// 			data: await token_info_response.json(),
// 		});
// 	} catch (err) {
// 		console.error("OAuth callback error:", err);
// 		res.status(500).json({ error: "Internal server error" });
// 	}
// };

// export default AuthController;
