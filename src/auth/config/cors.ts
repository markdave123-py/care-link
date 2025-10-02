import { env } from "./env";
import type * as cors from "cors";


const allowList = (env.CORS_OPTIONS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

export const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                 
    if (allowList.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET","HEAD","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
  optionsSuccessStatus: 204,
};