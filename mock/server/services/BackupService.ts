import BackupRepository from "@/repository/BackupRepository";
import { TargetResourceNotFoundError } from "@/repository/BackupRepository";
import type { FetchFunc, CreateFunc, UpdateFunc, DeleteFunc } from "@/types";
import type {
  BackupResponse,
  BackupCreateRequest,
  BackupPutRequest,
  BackupPatchRequest,
} from "@app/shared/types";
import { NotFoundError, BadRequestError } from "@/types";

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
  try {
    const newBackup = BackupRepository.create(payload.body);
    return {
      success: true,
      data: newBackup,
    };
  } catch (error) {
    if (error instanceof TargetResourceNotFoundError) {
      return {
        success: false,
        error: new BadRequestError(error.message),
      };
    }
    return {
      success: false,
      error: error as Error,
    };
  }
};

const update: UpdateFunc<
  BackupPutRequest | BackupPatchRequest,
  BackupResponse
> = (payload) => {
  try {
    const res = BackupRepository.update(payload.id, payload.body);
    return {
      success: true,
      data: res,
    };
  } catch (error) {
    if (error instanceof TargetResourceNotFoundError) {
      return {
        success: false,
        error: new NotFoundError(error.message),
      };
    }
    return {
      success: false,
      error: error as Error,
    };
  }
};

const remove: DeleteFunc = (payload) => {
  const success = BackupRepository.deleteById(payload.id);
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

export default BackupService;
