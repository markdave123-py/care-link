import { PrismaClient } from "@prisma/client";
import { NODE_ENV } from "../config";

const prisma = globalThis.prisma || new PrismaClient();

if ( NODE_ENV !== "production" ) {
    globalThis.prisma = prisma;
}

export default prisma;