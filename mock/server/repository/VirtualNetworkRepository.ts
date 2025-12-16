import type {
  VirtualNetworkResponse,
  VirtualNetworkCreateRequest,
  VirtualNetworkPatchRequest,
  VirtualNetworkPutRequest,
  SubnetResponse,
  SubnetCreateRequest,
} from "@app/shared/types";

import crypto from "crypto";
import { de } from "zod/locales";

class VirtualNetworkNotFoundError extends Error {
  constructor(id: string) {
    super(`Virtual Network with id ${id} not found`);
    this.name = "VirtualNetworkNotFoundError";
  }
}

let virtualNetworks: VirtualNetworkResponse[] | null = null;

const init = (): VirtualNetworkResponse[] => {
  return [
    {
      id: "839b86e1-d1d9-4000-b61a-87ce11b6d179",
      name: "vnet-1",
      cidr: "10.0.0.0/16",
      createdAt: new Date().toISOString(),
      subnets: [
        {
          id: "4bb1712a-c3e1-4655-a0e4-1d3d2fb63631",
          name: "subnet-1",
          cidr: "10.0.0.0/24",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2acf41f2-24fd-4226-ab24-b2a610af545c",
          name: "subnet-2",
          cidr: "10.0.1.0/24",
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: "65cd286b-37b7-4399-bf9e-c63ab79f0e7b",
      name: "vnet-2",
      cidr: "10.2.0.0/16",
      createdAt: new Date().toISOString(),
      subnets: [
        {
          id: "90bc1042-479c-4de2-a62e-78d205ad1c99",
          name: "subnet-1",
          cidr: "10.2.0.0/24",
          createdAt: new Date().toISOString(),
        },
        {
          id: "d9749788-9f98-4a44-958a-34e4660c7d9d",
          name: "subnet-2",
          cidr: "10.2.1.0/24",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ];
};

const list = (): VirtualNetworkResponse[] => {
  if (!virtualNetworks) {
    virtualNetworks = init();
  }
  return virtualNetworks;
};

const getById = (id: string): VirtualNetworkResponse | undefined => {
  return list().find((vnet) => vnet.id === id);
};

const create = (
  request: VirtualNetworkCreateRequest
): VirtualNetworkResponse => {
  const newVNet: VirtualNetworkResponse = {
    id: crypto.randomUUID(),
    name: request.name,
    cidr: request.cidr,
    createdAt: new Date().toISOString(),
    subnets: request.initialSubnets.map((subnet) => ({
      id: crypto.randomUUID(),
      name: subnet.name,
      cidr: subnet.cidr,
      createdAt: new Date().toISOString(),
    })),
  };
  list().push(newVNet);
  return newVNet;
};

const update = (
  id: string,
  request: VirtualNetworkPatchRequest | VirtualNetworkPutRequest
): VirtualNetworkResponse => {
  const vnet = getById(id);
  if (!vnet) {
    throw new VirtualNetworkNotFoundError(id);
  }
  vnet.name = request.name ?? vnet.name;
  return vnet;
};

const deleteById = (id: string): boolean => {
  const initialLength = list().length;
  virtualNetworks = list().filter((vnet) => vnet.id !== id);
  return list().length < initialLength;
};

const getSubnet = (
  vnetId: string,
  subnetId: string
): SubnetResponse | undefined => {
  const vnet = getById(vnetId);
  if (!vnet) {
    throw new VirtualNetworkNotFoundError(vnetId);
  }
  return vnet.subnets.find((subnet) => subnet.id === subnetId);
};

export const VirtualNetworkRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  getSubnet,
};

export default VirtualNetworkRepository;
