import { b as bytesToMb, m as mbToBytes } from './mathUtils.mjs';
import { a as getPrismaClient, P as PrismaClientKnownRequestError } from '../nitro/nitro.mjs';
import { g as getNodeService } from './NodeService.mjs';

const StoragePoolArgs = {
  select: {
    uuid: true,
    name: true,
    hasNetworkAccess: true,
    availableSizeMb: true,
    totalSizeMb: true,
    createdAt: true,
    node: {
      select: {
        uuid: true
      }
    }
  }
};
const StoragePoolManyArgs = {
  ...StoragePoolArgs,
  orderBy: {
    createdAt: "desc"
  }
};
const toRecord = (data) => {
  return {
    uuid: data.uuid,
    name: data.name,
    hasNetworkAccess: data.hasNetworkAccess,
    totalSizeBytes: mbToBytes(data.totalSizeMb),
    availableSizeBytes: mbToBytes(data.availableSizeMb),
    createdAt: data.createdAt,
    nodeId: data.node.uuid
  };
};
const list = async () => {
  try {
    const prisma = getPrismaClient();
    const rows = await prisma.storagePool.findMany(StoragePoolManyArgs);
    return { success: true, data: rows.map(toRecord) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError"
      }
    };
  }
};
const getById = async (id) => {
  try {
    const prisma = getPrismaClient();
    const row = await prisma.storagePool.findUnique({
      where: { uuid: id },
      ...StoragePoolArgs
    });
    return { success: true, data: row ? toRecord(row) : null };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError"
      }
    };
  }
};
const create = async (input) => {
  try {
    const prisma = getPrismaClient();
    const res = await prisma.storagePool.create({
      data: {
        name: input.name,
        hasNetworkAccess: input.hasNetworkAccess,
        totalSizeMb: bytesToMb(input.totalSizeBytes),
        availableSizeMb: bytesToMb(input.totalSizeBytes),
        node: {
          connect: { uuid: input.nodeId }
        }
      },
      ...StoragePoolArgs
    });
    return { success: true, data: toRecord(res) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "\u6307\u5B9A\u3055\u308C\u305F\u30CE\u30FC\u30C9\u304C\u5B58\u5728\u3057\u307E\u305B\u3093\u3002"
          }
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const update = async (id, updateFields) => {
  try {
    const prisma = getPrismaClient();
    const result = await prisma.storagePool.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
        hasNetworkAccess: updateFields.hasNetworkAccess
      },
      ...StoragePoolArgs
    });
    return { success: true, data: toRecord(result) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "\u6307\u5B9A\u3055\u308C\u305F\u30B9\u30C8\u30EC\u30FC\u30B8\u30D7\u30FC\u30EB\u304C\u5B58\u5728\u3057\u307E\u305B\u3093\u3002"
          }
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const deleteById = async (id) => {
  try {
    const prisma = getPrismaClient();
    await prisma.storagePool.delete({ where: { uuid: id } });
    return { success: true, data: void 0 };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "\u6307\u5B9A\u3055\u308C\u305F\u30B9\u30C8\u30EC\u30FC\u30B8\u30D7\u30FC\u30EB\u304C\u5B58\u5728\u3057\u307E\u305B\u3093\u3002"
          }
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const StoragePoolRepository = {
  list,
  getById,
  create,
  update,
  deleteById
};

const mapStoragePoolToResponse = (pool, nodeData) => {
  return {
    id: pool.uuid,
    name: pool.name,
    createdAt: pool.createdAt.toISOString(),
    totalSize: pool.totalSizeBytes,
    usedSize: pool.totalSizeBytes - pool.availableSizeBytes,
    availableSize: pool.availableSizeBytes,
    hasNetworkAccess: pool.hasNetworkAccess,
    node: nodeData
  };
};
const mapCreateRequestToInput = (data, totalSize) => {
  return {
    name: data.name,
    hasNetworkAccess: data.hasNetworkAccess,
    totalSizeBytes: totalSize,
    nodeId: data.nodeId
  };
};
const mapRequestToUpdateInput = (data) => {
  return {
    name: data.name,
    hasNetworkAccess: data.hasNetworkAccess
  };
};
const getStoragePoolService = (permission) => {
  const storagePoolService = {
    nodeService: getNodeService(),
    list: async (query) => {
      const repoPromise = StoragePoolRepository.list();
      const nodePromise = storagePoolService.nodeService.list();
      const [repoResult, nodeResult] = await Promise.all([
        repoPromise,
        nodePromise
      ]);
      if (!repoResult.success || !nodeResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const nodeMap = /* @__PURE__ */ new Map();
      for (const node of nodeResult.data) {
        nodeMap.set(node.id, node);
      }
      const data = repoResult.data.map((pool) => {
        const nodeData = nodeMap.get(pool.nodeId);
        return mapStoragePoolToResponse(pool, nodeData);
      });
      return { success: true, data };
    },
    getById: async (id) => {
      const repoResult = await StoragePoolRepository.getById(id);
      if (!repoResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      if (!repoResult.data) {
        return { success: false, error: { reason: "NotFound" } };
      }
      const nodeResult = await storagePoolService.nodeService.getById(
        repoResult.data.nodeId
      );
      if (!nodeResult.success || !nodeResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return {
        success: true,
        data: mapStoragePoolToResponse(repoResult.data, nodeResult.data)
      };
    },
    create: async (data) => {
      const poolPromise = StoragePoolRepository.create(
        mapCreateRequestToInput(data, 100 * 1024 * 1024)
      );
      const nodePromise = storagePoolService.nodeService.getById(data.nodeId);
      const [result, nodeResult] = await Promise.all([
        poolPromise,
        nodePromise
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
          error: { reason: "InternalError" }
        };
      }
      return {
        success: true,
        data: mapStoragePoolToResponse(result.data, nodeResult.data)
      };
    },
    update: async (id, data) => {
      const repoResult = await StoragePoolRepository.update(
        id,
        mapRequestToUpdateInput(data)
      );
      if (!repoResult.success) {
        if (repoResult.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const nodeResult = await storagePoolService.nodeService.getById(
        repoResult.data.nodeId
      );
      if (!nodeResult.success || !nodeResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return {
        success: true,
        data: mapStoragePoolToResponse(repoResult.data, nodeResult.data)
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
          error: { reason: "InternalError" }
        };
      }
      return { success: true, data: void 0 };
    }
  };
  return storagePoolService;
};

export { getStoragePoolService as g };
//# sourceMappingURL=StoragePoolService.mjs.map
