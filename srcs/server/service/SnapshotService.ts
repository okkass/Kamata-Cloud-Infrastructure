import { ResourceService } from "@@/server/common/service";
import {
  SnapshotResponse,
  SnapshotCreateRequest,
  SnapshotPatchRequest,
  SnapshotPutRequest,
} from "@@/shared/types";
import { UserPermissions } from "@@/server/types";
import { ServiceError } from "@@/server/common/errors";
import SnapshotRepository from "@@/server/repository/SnapshotRepository";

export const getSnapshotService = (permission: UserPermissions) => {
  const SnapshotService: ResourceService<
    SnapshotResponse,
    SnapshotCreateRequest,
    SnapshotPatchRequest | SnapshotPutRequest | never,
    ServiceError
  > = {
    permission,
    list(query?: string) {
      const snapshots = SnapshotRepository.list();
      return { success: true, data: snapshots };
    },
    getById(id) {
      const snapshot = SnapshotRepository.getById(id);
      if (!snapshot) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: snapshot };
    },
    create(data) {
      const newSnapshot = SnapshotRepository.create(data);
      if (!newSnapshot) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newSnapshot };
    },
    update(id, data) {
      const updatedSnapshot = SnapshotRepository.update(id, data);
      if (!updatedSnapshot) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedSnapshot };
    },
    delete(id) {
      const deleted = SnapshotRepository.deleteById(id);
      if (!deleted) {
        return { success: false, error: "NotFound" };
      }
      return { success: true, data: null };
    },
  };
  return SnapshotService;
};
