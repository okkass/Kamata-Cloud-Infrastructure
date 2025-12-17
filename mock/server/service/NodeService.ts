import type { ResourceService } from "@/common/service/ResourceService";
import type {
  NodeResponse,
  NodeCreateRequest,
  NodePatchRequest,
  NodePutRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import NodeRepository from "@/repository/NodeRepository";

export const getNodeService = (permission: UserPermissions) => {
  const NodeService: ResourceService<
    NodeResponse,
    NodeCreateRequest,
    NodePatchRequest | NodePutRequest,
    ServiceError
  > = {
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
  };
  return NodeService;
};
