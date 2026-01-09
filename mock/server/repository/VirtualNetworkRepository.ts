import type {
  VirtualNetworkResponse,
  VirtualNetworkCreateRequest,
  VirtualNetworkPatchRequest,
  VirtualNetworkPutRequest,
  VirtualNetworkSummaryResponse,
  SubnetResponse,
  SubnetCreateRequest,
  SubnetPatchRequest,
  SubnetPutRequest,
} from "@app/shared/types";

import crypto from "crypto";
import UserRepository from "./UserRepository";

let virtualNetworks: VirtualNetworkResponse[] | null = null;

const init = (): VirtualNetworkResponse[] => {
  return [
    {
      id: "839b86e1-d1d9-4000-b61a-87ce11b6d179",
      name: "vnet-1",
      cidr: "10.0.0.0/16",
      createdAt: new Date().toISOString(),
      owner: UserRepository.getById("5ab9e787-ad30-4f12-9ee4-f00c0491ee5d")!,
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
      owner: UserRepository.getById("5ab9e787-ad30-4f12-9ee4-f00c0491ee5d")!,
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
    owner: UserRepository.getById("5ab9e787-ad30-4f12-9ee4-f00c0491ee5d")!,
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
): VirtualNetworkResponse | undefined => {
  const vnet = getById(id);
  if (!vnet) {
    return undefined;
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
    return undefined;
  }
  let ret = vnet.subnets.find((subnet) => subnet.id === subnetId);
  if (!ret) {
    return undefined;
  }
  const summary: VirtualNetworkSummaryResponse = {
    id: vnet.id,
    name: vnet.name,
    cidr: vnet.cidr,
    createdAt: vnet.createdAt,
  };
  ret.parent = summary;
  return ret;
};

const getSubnetById = (subnetId: string): SubnetResponse | undefined => {
  for (const vnet of list()) {
    const subnet = vnet.subnets.find((subnet) => subnet.id === subnetId);
    if (subnet) {
      const summary: VirtualNetworkSummaryResponse = {
        id: vnet.id,
        name: vnet.name,
        cidr: vnet.cidr,
        createdAt: vnet.createdAt,
      };
      subnet.parent = summary;
      return subnet;
    }
  }
  return undefined;
};

const listSubnets = (vnetId: string): SubnetResponse[] | undefined => {
  const vnet = getById(vnetId);
  if (!vnet) {
    return undefined;
  }
  return vnet.subnets;
};

const createSubnet = (
  vnetId: string,
  request: SubnetCreateRequest
): SubnetResponse | undefined => {
  const vnet = getById(vnetId);
  if (!vnet) {
    return undefined;
  }
  const newSubnet: SubnetResponse = {
    id: crypto.randomUUID(),
    name: request.name,
    cidr: request.cidr,
    createdAt: new Date().toISOString(),
  };
  vnet.subnets.push(newSubnet);
  return newSubnet;
};

const updateSubnet = (
  vnetId: string,
  subnetId: string,
  request: SubnetPatchRequest | SubnetPutRequest
): SubnetResponse | undefined => {
  const vnet = getById(vnetId);
  if (!vnet) {
    return undefined;
  }
  const subnet = getSubnet(vnetId, subnetId);
  if (!subnet) {
    return undefined;
  }
  subnet.name = request.name ?? subnet.name;
  subnet.cidr = request.cidr ?? subnet.cidr;
  return subnet;
};

const deleteSubnet = (vnetId: string, subnetId: string): boolean => {
  const vnet = getById(vnetId);
  if (!vnet) {
    return false;
  }
  const initialLength = vnet.subnets.length;
  vnet.subnets = vnet.subnets.filter((subnet) => subnet.id !== subnetId);
  return vnet.subnets.length < initialLength;
};

export const VirtualNetworkRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  getSubnet,
  listSubnets,
  createSubnet,
  updateSubnet,
  deleteSubnet,
  getSubnetById,
};

export default VirtualNetworkRepository;
