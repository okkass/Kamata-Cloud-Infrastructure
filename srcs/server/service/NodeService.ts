import type { ResourceService } from "@@/server/common/service/ResourceService";
import type { Result } from "@@/server/common/type";
import type {
  NodeResponse,
  NodeCreateRequest,
  NodePatchRequest,
  NodePutRequest,
  DeviceResponse,
  NodeCandidateResponse,
} from "@@/shared/types";
import { UserPermissions } from "@@/server/types";
import type { ServiceError } from "@@/server/common/errors";
import NodeRepository from "@@/server/repository/NodeRepository";

type NodeService = ResourceService<
  NodeResponse,
  NodeCreateRequest,
  NodePatchRequest | NodePutRequest,
  ServiceError
> & {
  listNewDevices: (nodeId: string) => Result<DeviceResponse[], ServiceError>;
  listCandidates: () => Result<NodeCandidateResponse[], ServiceError>;
};

export const getNodeService = (permission: UserPermissions) => {
  const nodeService: NodeService = {
    permission,
    list(query) {
      const nodes = NodeRepository.list();
      return { success: true, data: nodes };
    },
    getById(id) {
      const node = NodeRepository.getById(id);
      if (!node) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: node };
    },
    create(data) {
      const newNode = NodeRepository.create(data);
      if (!newNode) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newNode };
    },
    update(id, data) {
      const updatedNode = NodeRepository.update(id, data);
      if (!updatedNode) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedNode };
    },
    delete(id) {
      const deleted = NodeRepository.deleteById(id);
      if (!deleted) {
        return { success: false, error: "NotFound" };
      }
      return { success: true, data: null };
    },
    listNewDevices(nodeId) {
      const devices = NodeRepository.listDevices();
      return { success: true, data: devices };
    },
    listCandidates() {
      const candidates = NodeRepository.listCandidates();
      return { success: true, data: candidates };
    },
  };
  return nodeService;
};
