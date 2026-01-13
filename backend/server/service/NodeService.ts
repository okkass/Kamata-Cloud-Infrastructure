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
import { NodeGateway } from "@/gateway/NodeGateway";

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

export const getNodeService = (permission: UserPermissions) => {
  const nodeService: NodeService = {
    permission,
    async list(query) {
      const nodes = await NodeGateway.getNodes();
      console.log(nodes);

      return { success: false, error: { reason: "NotImplemented" } };
    },
    async getById(id) {
      return { success: false, error: { reason: "NotImplemented" } };
    },
    async create(data) {
      return { success: false, error: { reason: "NotImplemented" } };
    },
    async update(id, data) {
      return { success: false, error: { reason: "NotImplemented" } };
    },
    async delete(id) {
      return { success: false, error: { reason: "NotImplemented" } };
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
