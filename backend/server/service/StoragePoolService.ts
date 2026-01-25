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
  StoragePoolCreateInput,
  StoragePoolUpdateInput,
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
    totalSize: pool.totalSizeMb * 1024 * 1024,
    usedSize:
      pool.totalSizeMb * 1024 * 1024 - pool.availableSizeMb * 1024 * 1024,
    hasNetworkAccess: pool.hasNetworkAccess,
    node: nodeData,
  };
};

const mapCreateRequestToInput = (
  data: StoragePoolCreateRequest,
  totalSize: number,
): StoragePoolCreateInput => {
  return {
    name: data.name,
    hasNetworkAccess: data.hasNetworkAccess,
    totalSizeMb: totalSize / (1024 * 1024),
    nodeId: data.nodeId,
  };
};

const mapPatchRequestToUpdateInput = (
  data: StoragePoolPatchRequest | StoragePoolPutRequest,
): StoragePoolUpdateInput => {
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
    async list(query) {
      try {
        const poolsPromise = StoragePoolRepository.list();
        const nodesPromise = this.nodeService.list();
        const [pools, nodesResult] = await Promise.all([
          poolsPromise,
          nodesPromise,
        ]);
        if (!nodesResult.success) {
          return {
            success: false,
            error: {
              reason: "InternalError",
            },
          };
        }
        const result = pools.map((pool) => {
          const nodeData = nodesResult.data.find(
            (node) => node.id === pool.node.uuid,
          );
          return mapStoragePoolToResponse(pool, nodeData!);
        });
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
    },
    async getById(id) {
      try {
        const pool = await StoragePoolRepository.getById(id);
        if (!pool) {
          return {
            success: false,
            error: { reason: "NotFound" },
          };
        }
        const nodeResult = await this.nodeService.getById(pool.node.uuid);
        if (!nodeResult.success) {
          return {
            success: false,
            error: { reason: "InternalError" },
          };
        }
        const result = mapStoragePoolToResponse(pool, nodeResult.data);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
    },
    async create(data) {
      try {
        // ほんとはここでgatawayに依頼してストレージプールを作成させる
        const totalSize = 100 * 1024 * 1024 * 1024; // 仮に100GBで
        const input = mapCreateRequestToInput(data, totalSize);
        const newPool = await StoragePoolRepository.add(input);
        const nodeResult = await this.nodeService.getById(newPool.node.uuid);
        if (!nodeResult.success) {
          return {
            success: false,
            error: { reason: "InternalError" },
          };
        }
        const result = mapStoragePoolToResponse(newPool, nodeResult.data);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
    },
    async update(id, data) {
      try {
        const updateInput = mapPatchRequestToUpdateInput(data);
        const updatedPool = await StoragePoolRepository.update(id, updateInput);
        const nodeResult = await this.nodeService.getById(
          updatedPool.node.uuid,
        );
        if (!nodeResult.success) {
          return {
            success: false,
            error: { reason: "InternalError" },
          };
        }
        const result = mapStoragePoolToResponse(updatedPool, nodeResult.data);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
    },
    async delete(id) {
      try {
        await StoragePoolRepository.deleteById(id);
        return { success: true, data: null };
      } catch (error) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
    },
  };
  return storagePoolService;
};
