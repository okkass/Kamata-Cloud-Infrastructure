import InstanceTypeRepository from "@/repository/InstanceTypeRepository";
import type { FetchFunc, CreateFunc, UpdateFunc, DeleteFunc } from "@/types";
import type {
  InstanceTypeResponse,
  InstanceTypeCreateRequest,
  InstanceTypePatchRequest,
  InstanceTypePutRequest,
} from "@app/shared/types";
import { NotFoundError, BadRequestError } from "@/types";

const listInstanceTypes: FetchFunc<Array<InstanceTypeResponse>> = () => {
  const instanceTypes = InstanceTypeRepository.list();
  return {
    success: true,
    data: instanceTypes,
  };
};

const getById: FetchFunc<InstanceTypeResponse> = (payload) => {
  const instanceType = InstanceTypeRepository.getById(payload.id!);
  if (!instanceType) {
    return {
      success: false,
      error: new NotFoundError(`InstanceType with id ${payload.id} not found`),
    };
  }
  return {
    success: true,
    data: instanceType,
  };
};

const create: CreateFunc<InstanceTypeCreateRequest, InstanceTypeResponse> = (
  payload
) => {
  try {
    const newInstanceType = InstanceTypeRepository.create(payload.body);
    return {
      success: true,
      data: newInstanceType,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    };
  }
};

const update: UpdateFunc<
  InstanceTypePutRequest | InstanceTypePatchRequest,
  InstanceTypeResponse
> = (payload) => {
  try {
    const res = InstanceTypeRepository.update(payload.id, payload.body);
    return {
      success: true,
      data: res,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: new NotFoundError(error.message),
      };
    }
    return {
      success: false,
      error: error as Error,
    };
  }
};

const remove: DeleteFunc = (payload) => {
  const deleted = InstanceTypeRepository.deleteById(payload.id!);
  if (!deleted) {
    return {
      success: false,
      error: new NotFoundError(`InstanceType with id ${payload.id} not found`),
    };
  }
  return {
    success: true,
    data: null,
  };
};

export const InstanceTypeService = {
  listInstanceTypes,
  getById,
  create,
  update,
  remove,
};

export default InstanceTypeService;
