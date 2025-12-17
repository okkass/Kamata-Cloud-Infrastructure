import crypto from "crypto";
import type {
  NodeResponse,
  NodeCreateRequest,
  NodeCandidateResponse,
  NodePutRequest,
  NodePatchRequest,
  DeviceResponse,
} from "@app/shared/types";

let nodes: Array<NodeResponse> = [
  {
    id: "a2dcd604-49cb-4e1c-826a-2071d50404a3",
    name: "Node-1",
    ipAddress: "10.0.0.1",
    status: "active",
    isAdmin: true,
    createdAt: new Date().toISOString(),
    cpuUtilization: Math.random(),
    memoryUtilization: Math.random(),
    storageUtilization: Math.random(),
  },
  {
    id: "7b57836d-cc87-40e1-938c-66682f1a108b",
    name: "Node-2",
    ipAddress: "10.0.0.2",
    status: "active",
    isAdmin: false,
    createdAt: new Date().toISOString(),
    cpuUtilization: Math.random(),
    memoryUtilization: Math.random(),
    storageUtilization: Math.random(),
  },
  {
    id: "111e2fec-1b5e-49f6-8685-762a91184d8a",
    name: "Node-3",
    ipAddress: "10.0.0.3",
    status: "active",
    isAdmin: false,
    createdAt: new Date().toISOString(),
    cpuUtilization: Math.random(),
    memoryUtilization: Math.random(),
    storageUtilization: Math.random(),
  },
];

let nodeCandidates: Array<NodeCandidateResponse> = [
  {
    name: "New-Node-1",
    ipAddress: "10.0.0.4",
  },
  {
    name: "New-Node-2",
    ipAddress: "10.0.0.5",
  },
];

let devices: Array<DeviceResponse> = [
  {
    devicePath: "/dev/sdb",
    deviceName: "Toshiba SSD",
    size: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
  },
  {
    devicePath: "/dev/sdc",
    deviceName: "Seagate HDD",
    size: 4 * 1024 * 1024 * 1024 * 1024, // 4 TB
  },
];

const list = (): Array<NodeResponse> => {
  return nodes;
};

const listCandidates = (): Array<NodeCandidateResponse> => {
  return nodeCandidates;
};

const listDevices = (): Array<DeviceResponse> => {
  return devices;
};

const getById = (id: string): NodeResponse | undefined => {
  return nodes.find((node) => node.id === id);
};

const create = (request: NodeCreateRequest): NodeResponse => {
  const newNode: NodeResponse = {
    id: crypto.randomUUID(),
    name: request.name ?? "Node-IP-" + request.ipAddress,
    ipAddress: request.ipAddress,
    status: "active",
    isAdmin: request.isAdmin ?? false,
    createdAt: new Date().toISOString(),
    cpuUtilization: Math.random(),
    memoryUtilization: Math.random(),
    storageUtilization: Math.random(),
  };
  nodes.push(newNode);
  return newNode;
};

const update = (
  id: string,
  updateFields: NodePutRequest | NodePatchRequest
): NodeResponse | undefined => {
  let target = getById(id);
  if (target === undefined) {
    return undefined;
  }

  target.name = updateFields.name ?? target.name;
  target.isAdmin = updateFields.isAdmin ?? target.isAdmin;

  return target;
};

const deleteById = (id: string): boolean => {
  const initialLength = nodes.length;
  nodes = nodes.filter((node) => node.id !== id);
  return nodes.length < initialLength;
};

export const NodeRepository = {
  list,
  listCandidates,
  listDevices,
  getById,
  create,
  update,
  deleteById,
};

export default NodeRepository;
