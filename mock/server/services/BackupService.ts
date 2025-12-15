import { BackupRepository } from "@/api/repository/BackupRepository";
import type { ServiceResult } from "@/types";
import type { FetchFunc, CreateFunc, UpdateFunc, DeleteFunc } from "@/types";
import type {
  BackupResponse,
  BackupCreateRequest,
  BackupPutRequest,
  BackupPatchRequest,
} from "@app/shared/types";
import { NotFoundError } from "@/types";

const listBackups: FetchFunc<BackupResponse[]> = () => {
  return {
    success: true,
    data: BackupRepository.list(),
  };
};

const getById: FetchFunc<BackupResponse> = (payload) => {
  // これを呼ぶ前にバリデーション済み
  const backup = BackupRepository.getById(payload.id!);
  if (!backup) {
    return {
      success: false,
      error: new NotFoundError(`Backup with id ${payload.id} not found`),
    };
  }
  return {
    success: true,
    data: backup,
  };
};

const create: CreateFunc<BackupCreateRequest, BackupResponse> = (payload) => {
  const newBackup = BackupRepository.create(payload.body);
  if (!newBackup) {
    return {
      success: false,
      error: new NotFoundError("Failed to create backup"),
    };
  }
  return {
    success: true,
    data: newBackup,
  };
};

const update: UpdateFunc<
  BackupPutRequest | BackupPatchRequest,
  BackupResponse
> = (payload) => {
  const res = BackupRepository.update(payload.id, payload.body);
  if (!res) {
    return {
      success: false,
      error: new NotFoundError(`Backup with id ${payload.id} not found`),
    };
  }
  return {
    success: true,
    data: res,
  };
};

const remove: DeleteFunc = (payload) => {
  const success = BackupRepository.delete(payload.id);
  if (!success) {
    return {
      success: false,
      error: new NotFoundError(`Backup with id ${payload.id} not found`),
    };
  }
  return {
    success: true,
    data: null,
  };
};

export const BackupService = {
  listBackups,
  getById,
  create,
  update,
  remove,
};
