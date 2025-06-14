import type { Response } from "express";

export class responseHandler  {
  static success =  <T>(res: Response, statusCode: number, message: T) => {
    res.status(statusCode).json({
      status: "success",
      message,
    });
  };

  static error =  (res: Response, error: { statusCode?: number; message: string }) => {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
};
