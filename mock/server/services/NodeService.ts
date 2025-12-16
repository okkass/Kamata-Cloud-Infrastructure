import NodeRepository from "@/repository/NodeRepository";
import { NodeNotFoundError } from "@/repository/NodeRepository";
import type { FetchFunc, CreateFunc, UpdateFunc, DeleteFunc } from "@/types";
import type {
  NodeResponse,
  NodeCreateRequest,
  NodePatchRequest,
  NodePutRequest,
} from "@app/shared/types";
import { NotFoundError } from "@/types";

const list: FetchFunc<NodeResponse[]> = ({}) => {
  try {
    const nodes = NodeRepository.list();
    return { success: true, data: nodes };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

const getById: FetchFunc<NodeResponse> = ({ id }) => {
  try {
    const node = NodeRepository.getById(id!);
    if (!node) {
      return {
        success: false,
        error: new NotFoundError(`Node with id ${id} not found`),
      };
    }
    return { success: true, data: node };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

const create: CreateFunc<NodeCreateRequest, NodeResponse> = ({ body }) => {
  try {
    const newNode = NodeRepository.create(body!);
    return { success: true, data: newNode };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

const update: UpdateFunc<NodePutRequest | NodePatchRequest, NodeResponse> = ({
  id,
  body,
}) => {
  try {
    const updatedNode = NodeRepository.update(id!, body!);
    return { success: true, data: updatedNode };
  } catch (error) {
    if (error instanceof NodeNotFoundError) {
      return {
        success: false,
        error: new NotFoundError(`Node with id ${id} not found`),
      };
    }
    return { success: false, error: error as Error };
  }
};

const deleteById: DeleteFunc = ({ id }) => {
  try {
    const deleted = NodeRepository.deleteById(id!);
    if (!deleted) {
      return {
        success: false,
        error: new NotFoundError(`Node with id ${id} not found`),
      };
    }
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

export const NodeService = {
  list,
  getById,
  create,
  update,
  deleteById,
};
