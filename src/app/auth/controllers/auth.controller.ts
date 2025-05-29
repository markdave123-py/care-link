import type { Request, Response } from "express";

export const initializeGoogleAuth = (req: Request, res: Response) => {
    res.status(201).json({ message: "Initializing..."})
}