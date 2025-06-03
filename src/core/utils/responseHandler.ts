import { Response } from "express";

export const responseHandler = {
  success: (res: Response, statusCode: number, message: any) => {
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

