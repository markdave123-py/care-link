import type { Response } from "express";

export const responseHandler = {
  success: <T>(res: Response, statusCode: number, message: T) => {
    res.status(statusCode).json({
      status: "success",
      message,
    });
  },

  error: (res: Response, error: { statusCode?: number; message: string }) => {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Something went wrong",
    });
  },
};
