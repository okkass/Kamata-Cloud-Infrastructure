import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";

import type { Result } from "@/common/type";
import type { Repository } from "./common";
import type { RepositoryError } from "@/common/errors";

export type BackupInsertProps = {};
export type BackupUpdateProps = {};
export type BackupRecord = {};

export const BackupRepository: Repository<
  BackupRecord,
  BackupInsertProps,
  BackupUpdateProps
> = {
  list: async (): Promise<Result<BackupRecord[], RepositoryError>> => {},
  getById: async (
    id: string,
  ): Promise<Result<BackupRecord, RepositoryError>> => {},
  create: async (
    props: BackupInsertProps,
  ): Promise<Result<BackupRecord, RepositoryError>> => {},
  update: async (
    id: string,
    props: BackupUpdateProps,
  ): Promise<Result<BackupRecord, RepositoryError>> => {},
  deleteById: async (
    id: string,
  ): Promise<Result<BackupRecord, RepositoryError>> => {},
};

export default BackupRepository;
