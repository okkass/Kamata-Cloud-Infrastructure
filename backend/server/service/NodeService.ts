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
import { NodeInsertProps, NodeUpdateProps } from "@/repository/NodeRepository";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";

type NodeService = ResourceService<
  NodeResponse,
  NodeCreateRequest,
  NodePatchRequest | NodePutRequest,
  ServiceError
> & {
  listNewDevices: (
    nodeId: string
  ) => Promise<Result<DeviceResponse[], ServiceError>>;
  listCandidates: () => Promise<Result<NodeCandidateResponse[], ServiceError>>;
};

const mapNodeToResponse = (node: any, pveNodeData: any): NodeResponse => {
  return {
    id: node.uuid,
    name: node.name,
    ipAddress: node.ipAddress,
    isAdmin: node.isAdmin,
    createdAt: node.createdAt,
    status: pveNodeData.status,
    cpuUtilization: pveNodeData.cpuUtilization,
    memoryUtilization: pveNodeData.memoryUtilization,
    storageUtilization: pveNodeData.storageUtilization,
  };
};

export const getNodeService = (permission: UserPermissions) => {
  const nodeService: NodeService = {
    permission,
    async list(query) {
      try {
        const nodes = await NodeRepository.list();
        const results = nodes.map((node) => {
          const pveNodeData = {
            status: "active",
            cpuUtilization: 0.8,
            memoryUtilization: 0.6,
            storageUtilization: 0.7,
          };
          return mapNodeToResponse(node, pveNodeData);
        });
        return { success: true, data: results };
      } catch (error) {
        console.error("Error listing nodes:", error);
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async getById(id) {
      try {
        const node = await NodeRepository.getById(id);
        if (!node) {
          return {
            success: false,
            error: { reason: "NotFound" },
          };
        }
        const pveNodeData = {
          status: "active",
          cpuUtilization: 0.8,
          memoryUtilization: 0.6,
          storageUtilization: 0.7,
        };
        const result = mapNodeToResponse(node, pveNodeData);
        return { success: true, data: result };
      } catch (error) {
        console.error("Error getting node:", error);
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async create(data) {
      const req: NodeInsertProps = {
        name: data.name ?? `node-${data.ipAddress}`,
        ipAddress: data.ipAddress,
        isAdmin: data.isAdmin ?? false,
      };

      try {
        // isAdminが立ってたらすでにあるisAdminをfalseに
        if (req.isAdmin) {
          await NodeRepository.updateIsAdminFalse();
        }
        const newNode = await NodeRepository.create(req);
        const pveNodeData = {
          status: "active",
          cpuUtilization: 0.8,
          memoryUtilization: 0.6,
          storageUtilization: 0.7,
        };
        const result = mapNodeToResponse(newNode, pveNodeData);
        return { success: true, data: result };
      } catch (error) {
        console.error("Error creating node:", error);
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async update(id, data) {
      const req: NodeUpdateProps = {
        name: data.name,
        isAdmin: data.isAdmin,
      };
      try {
        // isAdminが立ってたらすでにあるisAdminをfalseに
        if (req.isAdmin) {
          await NodeRepository.updateIsAdminFalse();
        }
        const res = await NodeRepository.update(id, req);
        const pveNodeData = {
          status: "active",
          cpuUtilization: 0.8,
          memoryUtilization: 0.6,
          storageUtilization: 0.7,
        };
        const result = mapNodeToResponse(res, pveNodeData);
        return { success: true, data: result };
      } catch (error) {
        console.error("Error updating node:", error);
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async delete(id) {
      try {
        await NodeRepository.deleteById(id);

        return { success: true, data: null };
      } catch (error) {
        // P2025を捕捉してNotFoundを返すようにする
        if ((error as PrismaClientKnownRequestError).code === "P2025") {
          return { success: false, error: { reason: "NotFound" } };
        }
        console.error("Error deleting node:", error);
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async listNewDevices(nodeId) {
      return { success: false, error: { reason: "NotImplemented" } };
    },
    async listCandidates() {
      return { success: false, error: { reason: "NotImplemented" } };
    },
  };
  return nodeService;
};
