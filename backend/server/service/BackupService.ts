import type { ResourceService } from "@/common/service";
import type { SuccessDetail } from "@/common/SuccessDetail";
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

type BackupService = ResourceService<
  BackupResponse,
  BackupCreateRequest,
  BackupPatchRequest | BackupPutRequest,
  ServiceError
> & {
  restore: (backupId: string) => Result<SuccessDetail, ServiceError>;
};

export const getBackupService = (permission: UserPermissions) => {
  const BackupService: BackupService = {
    list(query?: string) {
      const backups = BackupRepository.list();
      return { success: true, data: backups };
    },
    getById(id: string) {
      const backup = BackupRepository.getById(id);
      if (!backup) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: backup };
    },
    create(data: BackupCreateRequest) {
      const newBackup = BackupRepository.create(data);
      if (!newBackup) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newBackup };
    },
    update(id: string, data: BackupPatchRequest | BackupPutRequest) {
      const updatedBackup = BackupRepository.update(id, data);
      if (!updatedBackup) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedBackup };
    },
    delete(id: string) {
      const deleted = BackupRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: null };
    },
    restore(backupId) {
      return { success: true, data: "Accepted" };
    },
  };
  return BackupService;
};
