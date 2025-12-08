import type {
  StoragePoolResponse,
  StoragePoolCreateRequest,
  StoragePoolPatchRequest,
  StoragePoolPutRequest,
} from "@app/shared/types";
import crypto from "crypto";
import { getNodeById } from "./nodesService";
import { getRandomInt } from "@utils/mathUtils";

let storagePools: Array<StoragePoolResponse> = [
  {
    id: "6b593061-0281-4ef1-8b63-96924137b878",
    name: "Node1-Pool1-Network",
    node: getNodeById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
    createdAt: new Date().toISOString(),
    totalSize: 500 * 1024 * 1024 * 1024, // 500 GB
    usedSize: 200 * 1024 * 1024 * 1024, // 200 GB
    hasNetworkAccess: true,
  },
  {
    id: "dc88d67a-848c-48f4-80ab-2066231f75ed",
    name: "Node1-Pool1-NoNetwork",
    node: getNodeById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
    createdAt: new Date().toISOString(),
    totalSize: 500 * 1024 * 1024 * 1024, // 500 GB
    usedSize: 200 * 1024 * 1024 * 1024, // 200 GB
    hasNetworkAccess: false,
  },
  {
    id: "31d51cf9-ce8a-4406-9fe1-3bf4a2a1fb68",
    name: "Node1-Pool2-Network",
    node: getNodeById("7b57836d-cc87-40e1-938c-66682f1a108b")!,
    createdAt: new Date().toISOString(),
    totalSize: 1000 * 1024 * 1024 * 1024, // 1000 GB
    usedSize: 200 * 1024 * 1024 * 1024, // 200 GB
    hasNetworkAccess: true,
  },
  {
    id: "9e5d1831-218f-47b0-a82c-77f031862107",
    name: "Node1-Pool2-NoNetwork",
    node: getNodeById("7b57836d-cc87-40e1-938c-66682f1a108b")!,
    createdAt: new Date().toISOString(),
    totalSize: 1000 * 1024 * 1024 * 1024, // 1000 GB
    usedSize: 200 * 1024 * 1024 * 1024, // 200 GB
    hasNetworkAccess: false,
  },
];

export const getStoragePools = (): Array<StoragePoolResponse> => {
  return storagePools;
};

export const getStoragePoolById = (
  id: string
): StoragePoolResponse | undefined => {
  return storagePools.find((pool) => pool.id === id);
};

export const addStoragePool = (
  pool: StoragePoolCreateRequest
): StoragePoolResponse => {
  const uuid = crypto.randomUUID();
  const newPool: StoragePoolResponse = {
    id: uuid,
    node: getNodeById(pool.nodeId)!,
    name: pool.name,
    createdAt: new Date().toISOString(),
    totalSize: getRandomInt(100, 1000) * 1024 * 1024 * 1024, // Random size between 100 GB and 1000 GB
    usedSize: 0,
    hasNetworkAccess: pool.hasNetworkAccess,
  };
  storagePools.push(newPool);
  return newPool;
};

export const updateStoragePool = (
  id: string,
  updateFields: StoragePoolPatchRequest | StoragePoolPutRequest
): StoragePoolResponse | undefined => {
  let target = getStoragePoolById(id);
  if (target === undefined) {
    return undefined;
  }

  target.name = updateFields.name ?? target.name;
  target.hasNetworkAccess =
    updateFields.hasNetworkAccess ?? target.hasNetworkAccess;

  return target;
};

export const deleteStoragePool = (id: string): boolean => {
  const initialLength = storagePools.length;
  storagePools = storagePools.filter((pool) => pool.id !== id);
  return storagePools.length < initialLength;
};
