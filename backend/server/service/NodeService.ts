import type { ResourceService } from "@/common/service/ResourceService";
import type { Result } from "@/common/type";
import type {
  NodeResponse,
  NodeCreateRequest,
  NodePatchRequest,
  NodePutRequest,
  DeviceResponse,
  NodeCandidateResponse,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import NodeRepository from "@/repository/NodeRepository";
import {
  NodeInsertProps,
  NodeUpdateProps,
  NodeRecord,
} from "@/repository/NodeRepository";

type NodeService = ResourceService<
  NodeResponse,
  NodeCreateRequest,
  NodePatchRequest | NodePutRequest,
  ServiceError
> & {
  listNewDevices: (
    nodeId: string,
  ) => Promise<Result<DeviceResponse[], ServiceError>>;
  listCandidates: () => Promise<Result<NodeCandidateResponse[], ServiceError>>;
};

export const mapNodeToResponse = (
  node: NodeRecord,
  pveNodeData: {
    status: "active" | "inactive";
    cpuUtilization: number;
    memoryUtilization: number;
    storageUtilization: number;
  },
): NodeResponse => {
  return {
    id: node.uuid,
    name: node.name,
    ipAddress: node.ipAddress,
    isAdmin: node.isAdmin,
    createdAt: node.createdAt.toISOString(),
    status: pveNodeData.status,
    cpuUtilization: pveNodeData.cpuUtilization,
    memoryUtilization: pveNodeData.memoryUtilization,
    storageUtilization: pveNodeData.storageUtilization,
  };
};

export const getNodeService = (permission?: UserPermissions) => {
  const nodeService: NodeService = {
    list: async (query) => {
      const repositoryResult = await NodeRepository.list();
      if (!repositoryResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
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
            storageUtilization: 0.7,
          });
        }),
      };
    },
    getById: async (id) => {
      const repositoryResult = await NodeRepository.getById(id);
      if (!repositoryResult.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      const node = repositoryResult.data;
      if (!node) {
        return {
          success: false,
          error: { reason: "NotFound" },
        };
      }
      const pveNodeData = {
        status: "active" as const,
        cpuUtilization: 0.8,
        memoryUtilization: 0.6,
        storageUtilization: 0.7,
      };
      const result = mapNodeToResponse(node, pveNodeData);
      return { success: true, data: result };
    },
    create: async (data) => {
      const req: NodeInsertProps = {
        name: data.name ?? `node-${data.ipAddress}`,
        ipAddress: data.ipAddress,
        isAdmin: data.isAdmin ?? false,
      };

      const res = await NodeRepository.create(req);
      if (!res.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      const node = res.data;
      const pveNodeData = {
        status: "active" as const,
        cpuUtilization: 0.8,
        memoryUtilization: 0.6,
        storageUtilization: 0.7,
      };
      const result = mapNodeToResponse(node, pveNodeData);
      return { success: true, data: result };
    },
    update: async (id, data) => {
      const req: NodeUpdateProps = {
        name: data.name,
        isAdmin: data.isAdmin,
      };
      const res = await NodeRepository.update(id, req);
      if (!res.success) {
        if (res.error.reason === "NotFound") {
          return {
            success: false,
            error: { reason: "NotFound" },
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      const node = res.data;
      const pveNodeData = {
        status: "active" as const,
        cpuUtilization: 0.8,
        memoryUtilization: 0.6,
        storageUtilization: 0.7,
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
            error: { reason: "NotFound" },
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return { success: true, data: undefined };
    },
    listNewDevices: async (nodeId) => {
      return { success: false, error: { reason: "NotImplemented" } };
    },
    listCandidates: async () => {
      return { success: false, error: { reason: "NotImplemented" } };
    },
  };
  return nodeService;
};
