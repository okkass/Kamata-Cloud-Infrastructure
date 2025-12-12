import crypto from "crypto";
import type {
  NodeResponse,
  NodeCreateRequest,
  NodeCandidateResponse,
  NodePutRequest,
  NodePatchRequest,
  DeviceResponse,
} from "@app/shared/types";

import type { ServiceResult } from "./common.ts";
import { create404Error } from "@utils/errors.js";

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

const getNodes = (): Array<NodeResponse> => {
  return nodes;
};

const getNodeById = (id: string): NodeResponse | undefined => {
  return nodes.find((node) => node.id === id);
};

const addNode = (node: NodeCreateRequest): NodeResponse => {
  const uuid = crypto.randomUUID();
  const newNode: NodeResponse = {
    id: uuid,
    name: node.name ?? "Node-IP-" + node.ipAddress,
    ipAddress: node.ipAddress,
    status: "active",
    isAdmin: node.isAdmin ?? false,
    createdAt: new Date().toISOString(),
    cpuUtilization: Math.random(),
    memoryUtilization: Math.random(),
    storageUtilization: Math.random(),
  };
  nodes.push(newNode);
  return newNode;
};

const getNodeCandidates = (): Array<NodeCandidateResponse> => {
  return nodeCandidates;
};

const updateNode = (
  id: string,
  updateFields: NodePutRequest | NodePatchRequest
): NodeResponse | undefined => {
  let target = getNodeById(id);
  if (target === undefined) {
    return undefined;
  }

  target.name = updateFields.name ?? target.name;
  target.isAdmin = updateFields.isAdmin ?? target.isAdmin;

  return target;
};

const deleteNode = (id: string): boolean => {
  const initialLength = nodes.length;
  nodes = nodes.filter((node) => node.id !== id);
  return nodes.length < initialLength;
};

const getDevices = (): Array<DeviceResponse> => {
  return devices;
};

const list = (): ServiceResult<Array<NodeResponse>> => {
  return { success: true, data: getNodes() };
};

const get = (id: string): ServiceResult<NodeResponse> => {
  const node = getNodeById(id);
  if (!node) {
    return {
      success: false,
      error: create404Error("Node not found"),
      status: 404,
    };
  }
  return { success: true, data: node };
};

const create = (node: NodeCreateRequest): ServiceResult<NodeResponse> => {
  const newNode = addNode(node);
  return { success: true, data: newNode, status: 201 };
};

const update = (
  id: string,
  updateFields: NodePutRequest | NodePatchRequest
): ServiceResult<NodeResponse> => {
  const updatedNode = updateNode(id, updateFields);
  if (!updatedNode) {
    return {
      success: false,
      error: create404Error("Node not found"),
      status: 404,
    };
  }
  return { success: true, data: updatedNode };
};

const remove = (id: string): ServiceResult<null> => {
  const deleted = deleteNode(id);
  if (!deleted) {
    return {
      success: false,
      error: create404Error("Node not found"),
      status: 404,
    };
  }
  return { success: true, data: null, status: 204 };
};

const listCandidates = (): ServiceResult<Array<NodeCandidateResponse>> => {
  return { success: true, data: getNodeCandidates() };
};

const listDevices = (): ServiceResult<Array<DeviceResponse>> => {
  return { success: true, data: getDevices() };
};

export const nodeService = {
  list,
  get,
  create,
  update,
  remove,
  listCandidates,
  listDevices,
};
