import type {
  InstanceTypeResponse,
  InstanceTypePatchRequest,
  InstanceTypePutRequest,
  InstanceTypeCreateRequest,
} from "@@/shared/types";
import crypto from "crypto";

let instanceTypes: Array<InstanceTypeResponse> | null = null;

const initInstanceTypes = (): Array<InstanceTypeResponse> => {
  return [
    {
      id: "f4841834-88f5-43c5-8d74-c8bc62d0ee3f",
      name: "nano",
      createdAt: new Date().toISOString(),
      cpuCore: 1,
      memorySize: 1 * 1024 * 1024 * 1024, // 1 GB
    },
    {
      id: "94628e75-6f53-42ea-aa85-1fecc7859d19",
      name: "small",
      createdAt: new Date().toISOString(),
      cpuCore: 2,
      memorySize: 2 * 1024 * 1024 * 1024, // 2 GB
    },
    {
      id: "42c3099f-bcd4-4d59-8661-e665aa59f6f1",
      name: "medium",
      createdAt: new Date().toISOString(),
      cpuCore: 4,
      memorySize: 4 * 1024 * 1024 * 1024, // 4 GB
    },
  ];
};

const list = (): Array<InstanceTypeResponse> => {
  if (!instanceTypes) {
    instanceTypes = initInstanceTypes();
  }
  return instanceTypes;
};

const getById = (id: string): InstanceTypeResponse | undefined => {
  return list().find((instanceType) => instanceType.id === id);
};

const create = (
  instanceType: InstanceTypeCreateRequest
): InstanceTypeResponse => {
  const newInstanceType: InstanceTypeResponse = {
    id: crypto.randomUUID(),
    name: instanceType.name,
    createdAt: new Date().toISOString(),
    cpuCore: instanceType.cpuCore,
    memorySize: instanceType.memorySize,
  };
  list().push(newInstanceType);
  return newInstanceType;
};

const update = (
  id: string,
  updateFields: InstanceTypePatchRequest | InstanceTypePutRequest
): InstanceTypeResponse | undefined => {
  let target = getById(id);
  if (target === undefined) {
    return undefined;
  }

  target.name = updateFields.name ?? target.name;
  target.cpuCore = updateFields.cpuCore ?? target.cpuCore;
  target.memorySize = updateFields.memorySize ?? target.memorySize;

  return target;
};

const deleteById = (id: string): boolean => {
  const initialLength = list().length;
  instanceTypes = list().filter((instanceType) => instanceType.id !== id);
  return list().length < initialLength;
};

export const InstanceTypeRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default InstanceTypeRepository;
