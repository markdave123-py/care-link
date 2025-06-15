import type { Response } from "express";

class ResponseHandler {
  public success<T>(res: Response, statusCode: number,message: string, data?: T): void {
    res.status(statusCode).json({
      status: "success",
      message,
      data: data ?? null,  // Include data if provided, else null
    });
  }

  public error(res: Response, error: { statusCode?: number; message: string; data?: unknown }): void {
    res.status(error.statusCode ?? 500).json({
      status: "error",
      message: error.message || "Something went wrong",
      data: error.data ?? null,  // Allow sending extra error info if needed
    });
  }
}

export const responseHandler = new ResponseHandler();




// import type { Response } from "express";

// export const responseHandler = {
//   success: <T>(res: Response, statusCode: number, message: T) => {
//     res.status(statusCode).json({
//       status: "success",
//       message,
//     });
//   },

//   error: (res: Response, error: { statusCode?: number; message: string }) => {
//     res.status(error.statusCode || 500).json({
//       status: "error",
//       message: error.message || "Something went wrong",
//     });
//   },
// };
