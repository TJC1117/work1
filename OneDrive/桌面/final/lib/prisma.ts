import { PrismaClient } from "./generated/prisma";

const globalForPrisma = global as any;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // 可選，方便除錯
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
