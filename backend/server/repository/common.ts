import { PrismaClient } from "@@/generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

let adapter: PrismaMariaDb | undefined;
let prisma: PrismaClient | undefined;

export const getPrismaClient = (): PrismaClient => {
  if (!adapter) {
    adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: 3306,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
  }
  if (!prisma) {
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
};
