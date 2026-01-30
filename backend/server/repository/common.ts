import { PrismaClient } from "@@/generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Result } from "@/common/type";
import { RepositoryError } from "@/common/errors";

let adapter: PrismaMariaDb | undefined;
let prisma: PrismaClient | undefined;

export type Repository<TCreate, TUpdate, TResponse> = {
  list: (userId?: string) => Promise<Result<TResponse[], RepositoryError>>;
  getById: (id: string) => Promise<Result<TResponse | null, RepositoryError>>;
  create: (data: TCreate) => Promise<Result<TResponse, RepositoryError>>;
  update: (
    id: string,
    data: TUpdate,
  ) => Promise<Result<TResponse, RepositoryError>>;
  deleteById: (id: string) => Promise<Result<void, RepositoryError>>;
};

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

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
