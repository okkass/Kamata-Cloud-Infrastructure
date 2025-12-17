import type { ResourceService } from "@/common/service";
import type {
  BackupResponse,
  BackupCreateRequest,
  BackupPatchRequest,
  BackupPutRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import BackupRepository from "@/repository/BackupRepository";
import type { Result } from "@/common/type";

export const getBackupService = (permission: UserPermissions) => {
  const BackupService: ResourceService<
    BackupResponse,
    BackupCreateRequest,
    BackupPatchRequest | BackupPutRequest,
    ServiceError
  > = {
    permission,
    list: (query?: string): Result<BackupResponse[], ServiceError> => {
      const backups = BackupRepository.list();
      return { success: true, data: backups };
    },
    getById: (id: string): Result<BackupResponse, ServiceError> => {
      const backup = BackupRepository.getById(id);
      if (!backup) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: backup };
    },
    create: (
      data: BackupCreateRequest
    ): Result<BackupResponse, ServiceError> => {
      const newBackup = BackupRepository.create(data);
      if (!newBackup) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newBackup };
    },
    update: (
      id: string,
      data: BackupPatchRequest | BackupPutRequest
    ): Result<BackupResponse, ServiceError> => {
      const updatedBackup = BackupRepository.update(id, data);
      if (!updatedBackup) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedBackup };
    },
    delete: (id: string): Result<null, ServiceError> => {
      const deleted = BackupRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: null };
    },
  };
  return BackupService;
};
