import { PrismaClient } from '../../../generated/prisma';
import { env } from "../config/env";

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma = global.prisma || new PrismaClient();

if (env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
