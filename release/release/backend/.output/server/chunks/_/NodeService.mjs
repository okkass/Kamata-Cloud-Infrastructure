import { a as getPrismaClient, P as PrismaClientKnownRequestError } from '../nitro/nitro.mjs';

const nodeArgs = {
  select: {
    uuid: true,
    name: true,
    ipAddress: true,
    isAdmin: true,
    createdAt: true
  }
};
const list = async () => {
  try {
    const prisma = getPrismaClient();
    const nodes = await prisma.node.findMany({
      ...nodeArgs,
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: nodes };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const getById = async (uuid) => {
  try {
    const prisma = getPrismaClient();
    const node = await prisma.node.findUnique({
      where: { uuid },
      ...nodeArgs
    });
    return { success: true, data: node };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const create = async (data) => {
  try {
    const prisma = getPrismaClient();
    const newNode = await prisma.node.create({
      data: {
        name: data.name,
        ipAddress: data.ipAddress,
        isAdmin: data.isAdmin
      },
      ...nodeArgs
    });
    return { success: true, data: newNode };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const update = async (uuid, data) => {
  try {
    const prisma = getPrismaClient();
    const result = await prisma.$transaction(async (tx) => {
      if (data.isAdmin) {
        await tx.node.updateMany({
          where: {
            isAdmin: true
          },
          data: {
            isAdmin: false
          }
        });
      }
      const node = await prisma.node.update({
        where: {
          uuid
        },
        data: {
          name: data.name,
          isAdmin: data.isAdmin
        },
        ...nodeArgs
      });
      return node;
    });
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified node was not found."
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
const deleteById = async (uuid) => {
  try {
    const prisma = getPrismaClient();
    await prisma.node.delete({ where: { uuid } });
    return { success: true, data: void 0 };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified node was not found."
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
const NodeRepository = {
  list,
  getById,
  create,
  update,
  deleteById
};

const mapNodeToResponse = (node, pveNodeData) => {
  return {
    id: node.uuid,
    name: node.name,
    ipAddress: node.ipAddress,
    isAdmin: node.isAdmin,
    createdAt: node.createdAt.toISOString(),
    status: pveNodeData.status,
    cpuUtilization: pveNodeData.cpuUtilization,
    memoryUtilization: pveNodeData.memoryUtilization,
    storageUtilization: pveNodeData.storageUtilization
  };
};
const getNodeService = (permission) => {
  const nodeService = {
    list: async (query) => {
      const repositoryResult = await NodeRepository.list();
      if (!repositoryResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const nodes = repositoryResult.data;
      return {
        success: true,
        data: nodes.map((node) => {
          return mapNodeToResponse(node, {
            status: "active",
            cpuUtilization: 0.8,
            memoryUtilization: 0.6,
            storageUtilization: 0.7
          });
        })
      };
    },
    getById: async (id) => {
      const repositoryResult = await NodeRepository.getById(id);
      if (!repositoryResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const node = repositoryResult.data;
      if (!node) {
        return {
          success: false,
          error: { reason: "NotFound" }
        };
      }
      const pveNodeData = {
        status: "active",
        cpuUtilization: 0.8,
        memoryUtilization: 0.6,
        storageUtilization: 0.7
      };
      const result = mapNodeToResponse(node, pveNodeData);
      return { success: true, data: result };
    },
    create: async (data) => {
      var _a, _b;
      const req = {
        name: (_a = data.name) != null ? _a : `node-${data.ipAddress}`,
        ipAddress: data.ipAddress,
        isAdmin: (_b = data.isAdmin) != null ? _b : false
      };
      const res = await NodeRepository.create(req);
      if (!res.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const node = res.data;
      const pveNodeData = {
        status: "active",
        cpuUtilization: 0.8,
        memoryUtilization: 0.6,
        storageUtilization: 0.7
      };
      const result = mapNodeToResponse(node, pveNodeData);
      return { success: true, data: result };
    },
    update: async (id, data) => {
      const req = {
        name: data.name,
        isAdmin: data.isAdmin
      };
      const res = await NodeRepository.update(id, req);
      if (!res.success) {
        if (res.error.reason === "NotFound") {
          return {
            success: false,
            error: { reason: "NotFound" }
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const node = res.data;
      const pveNodeData = {
        status: "active",
        cpuUtilization: 0.8,
        memoryUtilization: 0.6,
        storageUtilization: 0.7
      };
      const result = mapNodeToResponse(node, pveNodeData);
      return { success: true, data: result };
    },
    delete: async (id) => {
      const res = await NodeRepository.deleteById(id);
      if (!res.success) {
        if (res.error.reason === "NotFound") {
          return {
            success: false,
            error: { reason: "NotFound" }
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return { success: true, data: void 0 };
    },
    listNewDevices: async (nodeId) => {
      return { success: false, error: { reason: "NotImplemented" } };
    },
    listCandidates: async () => {
      return { success: false, error: { reason: "NotImplemented" } };
    }
  };
  return nodeService;
};

export { getNodeService as g };
//# sourceMappingURL=NodeService.mjs.map
