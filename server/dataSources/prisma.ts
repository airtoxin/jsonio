import { PrismaClient } from "@prisma/client";

export type Prisma = PrismaClient;
export const prisma = new PrismaClient();
