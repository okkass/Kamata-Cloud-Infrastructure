import type { ResourceService } from "@/common/service/ResourceService";
import type {
  StoragePoolResponse,
  StoragePoolCreateRequest,
  StoragePoolPutRequest,
  StoragePoolPatchRequest,
  NodeResponse,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import StoragePoolRepository from "@/repository/StoragePoolRepository";
import type {
  StoragePoolRecord,
  StoragePoolCreateProps,
  StoragePoolUpdateProps,
} from "@/repository/StoragePoolRepository";
import { getNodeService } from "./NodeService";

const mapStoragePoolToResponse = (
  pool: StoragePoolRecord,
  nodeData: NodeResponse,
): StoragePoolResponse => {
  return {
    id: pool.uuid,
    name: pool.name,
    createdAt: pool.createdAt.toISOString(),
    totalSize: pool.totalSizeBytes,
    usedSize: pool.totalSizeBytes - pool.availableSizeBytes,
    availableSize: pool.availableSizeBytes,
    hasNetworkAccess: pool.hasNetworkAccess,
    node: nodeData,
  };
};

const mapCreateRequestToInput = (
  data: StoragePoolCreateRequest,
  totalSize: number,
): StoragePoolCreateProps => {
  return {
    name: data.name,
    hasNetworkAccess: data.hasNetworkAccess,
    totalSizeBytes: totalSize,
    nodeId: data.nodeId,
  };
};

const mapRequestToUpdateInput = (
  data: StoragePoolPatchRequest | StoragePoolPutRequest,
): StoragePoolUpdateProps => {
  return {
    name: data.name,
    hasNetworkAccess: data.hasNetworkAccess,
  };
};

type StoragePoolService = ResourceService<
  StoragePoolResponse,
  StoragePoolCreateRequest,
  StoragePoolPatchRequest | StoragePoolPutRequest,
  ServiceError
> & {
  nodeService: ReturnType<typeof getNodeService>;
};

export const getStoragePoolService = (permission: UserPermissions) => {
  const storagePoolService: StoragePoolService = {
    permission,
    nodeService: getNodeService(permission),
    list: async (query) => {
      const repoPromise = StoragePoolRepository.list();
      const nodePromise = storagePoolService.nodeService.list();
      const [repoResult, nodeResult] = await Promise.all([
        repoPromise,
        nodePromise,
      ]);

      if (!repoResult.success || !nodeResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      const nodeMap = new Map<string, NodeResponse>();
      for (const node of nodeResult.data) {
        nodeMap.set(node.id, node);
      }

      const data: StoragePoolResponse[] = repoResult.data.map((pool) => {
        const nodeData = nodeMap.get(pool.nodeId)!;
        return mapStoragePoolToResponse(pool, nodeData);
      });
      return { success: true, data };
    },
    getById: async (id) => {
      // ここは直列(nodeIdでNodeを取得する必要があるため)
      const repoResult = await StoragePoolRepository.getById(id);
      // 失敗なら内部エラー
      if (!repoResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      // 見つからなければNotFound
      if (!repoResult.data) {
        return { success: false, error: { reason: "NotFound" } };
      }
      const nodeResult = await storagePoolService.nodeService.getById(
        repoResult.data.nodeId,
      );
      // 見つからないはずないので、もしそうなら内部エラー
      if (!nodeResult.success || !nodeResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return {
        success: true,
        data: mapStoragePoolToResponse(repoResult.data, nodeResult.data),
      };
    },
    create: async (data) => {
      const poolPromise = StoragePoolRepository.create(
        mapCreateRequestToInput(data, 100 * 1024 * 1024),
      );
      const nodePromise = storagePoolService.nodeService.getById(data.nodeId);
      const [result, nodeResult] = await Promise.all([
        poolPromise,
        nodePromise,
      ]);
      if (!nodeResult.success) {
        if (nodeResult.error.reason === "NotFound") {
          return { success: false, error: { reason: "BadRequest" } };
        }
        return { success: false, error: { reason: "InternalError" } };
      }
      if (!result.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return {
        success: true,
        data: mapStoragePoolToResponse(result.data, nodeResult.data),
      };
    },
    update: async (id, data) => {
      const repoResult = await StoragePoolRepository.update(
        id,
        mapRequestToUpdateInput(data),
      );
      if (!repoResult.success) {
        if (repoResult.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      const nodeResult = await storagePoolService.nodeService.getById(
        repoResult.data.nodeId,
      );
      if (!nodeResult.success || !nodeResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return {
        success: true,
        data: mapStoragePoolToResponse(repoResult.data, nodeResult.data),
      };
    },
    delete: async (id) => {
      const result = await StoragePoolRepository.deleteById(id);
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return { success: true, data: undefined };
    },
  };
  return storagePoolService;
};
