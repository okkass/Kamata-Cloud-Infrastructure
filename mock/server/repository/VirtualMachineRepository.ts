import type {
  VirtualMachineResponse,
  NetworkInterfaceResponse,
  StorageResponse,
  SecurityGroupResponse,
  VirtualMachineCreateRequest,
  VirtualMachinePatchRequest,
  VirtualMachinePutRequest,
  StorageCreateRequest,
  StoragePatchRequest,
  StoragePutRequest,
  NetworkInterfaceCreateRequest,
  NetworkInterfacePatchRequest,
  NetworkInterfacePutRequest,
} from "@app/shared/types";
import type { VmSecurityGroupAddRequest } from "@/types";
import { SecurityGroupRepository } from "./SecurityGroupRepository";
import { NodeRepository } from "./NodeRepository";
import { StoragePoolRepository } from "./StoragePoolRepository";
import { ImageRepository } from "./ImageRepository";
import { InstanceTypeRepository } from "./InstanceTypeRepository";
import crypto from "crypto";
import VirtualNetworkRepository from "./VirtualNetworkRepository";

let virtualMachines: Array<VirtualMachineResponse> | null = null;

const initVirtualMachines = (): Array<VirtualMachineResponse> => {
  return [
    {
      id: "fd8467e4-f334-4827-bf69-79d6434a176e",
      name: "VM-01",
      status: "running",
      node: NodeRepository.getById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
      createdAt: new Date().toISOString(),
      securityGroups: [
        SecurityGroupRepository.getById(
          "81c210f6-8f8a-4554-9dd4-c58986827357"
        )!,
      ],
      storages: [
        {
          id: "c695a74c-2afa-4eab-82fe-57628fa9b33b",
          name: "VM-01-os-disk",
          size: 24 * 1024 * 1024 * 1024, // 24 GB
          pool: StoragePoolRepository.getById(
            "6b593061-0281-4ef1-8b63-96924137b878"
          )!,
          createdAt: new Date().toISOString(),
          devicePath: "/dev/vda",
        },
        {
          id: "56623330-a52b-4aa7-8ed7-eb12ae07686c",
          name: "VM-01-data-disk",
          size: 100 * 1024 * 1024 * 1024, // 100 GB
          pool: StoragePoolRepository.getById(
            "6b593061-0281-4ef1-8b63-96924137b878"
          )!,
          createdAt: new Date().toISOString(),
          devicePath: "/dev/vdb",
        },
      ],
      networkInterfaces: [
        {
          id: "a4e3e7f0-7a68-4ad8-8f8a-88956e1cb0a3",
          name: "eth0",
          macAddress: "52:54:00:12:34:56",
          ipAddress: "10.0.0.3",
          subnet: VirtualNetworkRepository.getSubnet(
            "839b86e1-d1d9-4000-b61a-87ce11b6d179",
            "4bb1712a-c3e1-4655-a0e4-1d3d2fb63631"
          )!,
        },
      ],
      cpuCore: 4,
      memorySize: 2 * 1024 * 1024 * 1024, // 2 GB
      cpuUtilization: Math.random(),
      memoryUtilization: Math.random(),
      storageUtilization: Math.random(),
    },
    {
      id: "fa7a4b5f-bd6a-42da-a1de-e12d26459377",
      name: "VM-02",
      status: "running",
      node: NodeRepository.getById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
      createdAt: new Date().toISOString(),
      securityGroups: [
        SecurityGroupRepository.getById(
          "81c210f6-8f8a-4554-9dd4-c58986827357"
        )!,
      ],
      storages: [
        {
          id: "827a7dca-9eb8-46bf-a9c8-5f8d085424c8",
          name: "VM-02-os-disk",
          size: 24 * 1024 * 1024 * 1024, // 24 GB
          pool: StoragePoolRepository.getById(
            "6b593061-0281-4ef1-8b63-96924137b878"
          )!,
          createdAt: new Date().toISOString(),
          devicePath: "/dev/vda",
        },
        {
          id: "8cffb301-7f9f-4dcc-8e4d-7ec693631595",
          name: "VM-02-data-disk",
          size: 100 * 1024 * 1024 * 1024, // 100 GB
          pool: StoragePoolRepository.getById(
            "6b593061-0281-4ef1-8b63-96924137b878"
          )!,
          createdAt: new Date().toISOString(),
          devicePath: "/dev/vdb",
        },
      ],
      networkInterfaces: [
        {
          id: "628e7371-7c6f-4961-aa66-c70687848745",
          name: "eth0",
          macAddress: "52:54:00:12:34:56",
          ipAddress: "10.0.0.4",
          subnet: VirtualNetworkRepository.getSubnet(
            "839b86e1-d1d9-4000-b61a-87ce11b6d179",
            "4bb1712a-c3e1-4655-a0e4-1d3d2fb63631"
          )!,
        },
      ],
      cpuCore: 4,
      memorySize: 2 * 1024 * 1024 * 1024, // 2 GB
      cpuUtilization: Math.random(),
      memoryUtilization: Math.random(),
      storageUtilization: Math.random(),
    },
  ];
};

const list = (): Array<VirtualMachineResponse> => {
  if (!virtualMachines) {
    virtualMachines = initVirtualMachines();
  }
  return virtualMachines;
};

const getById = (id: string): VirtualMachineResponse | undefined => {
  return list().find((vm) => vm.id === id);
};

const create = (
  data: VirtualMachineCreateRequest
): VirtualMachineResponse | undefined => {
  let cpuCore: number | undefined;
  let memorySize: number | undefined;
  // specの型で分岐
  if ("instanceTypeId" in data.spec) {
    const instanceType = InstanceTypeRepository.getById(
      data.spec.instanceTypeId
    );
    if (!instanceType) {
      console.warn(`Instance type not found: ${data.spec.instanceTypeId}`);
      return undefined;
    }
    cpuCore = instanceType.cpuCore;
    memorySize = instanceType.memorySize;
  } else if ("cpu" in data.spec && "memory" in data.spec) {
    cpuCore = data.spec.cpu;
    memorySize = data.spec.memory;
  } else {
    console.warn(`Invalid spec in request: ${JSON.stringify(data.spec)}`);
    return undefined;
  }
  const node = NodeRepository.getById(data.nodeId);
  const image = ImageRepository.getById(data.imageId);
  const securityGroups = data.securityGroupIds.map((sgId) =>
    SecurityGroupRepository.getById(sgId)
  );
  const storages = data.storages.map((storageReq) => {
    const pool = StoragePoolRepository.getById(storageReq.poolId);
    if (pool) {
      return {
        id: crypto.randomUUID(),
        name: storageReq.name,
        size: storageReq.size,
        pool: pool,
        createdAt: new Date().toISOString(),
        devicePath: "/dev/sdX",
      };
    }
    return undefined;
  });
  const nics = data.subnetIds.map((subnetId) => {
    const subnet = VirtualNetworkRepository.getSubnetById(subnetId);
    if (subnet) {
      return {
        id: crypto.randomUUID(),
        name: "ethX",
        macAddress: "52:54:00:ab:cd:ef",
        ipAddress: "10.0.0.X",
        subnet: subnet,
      };
    }
    return undefined;
  });
  // undefinedがあれば失敗
  if (
    !node ||
    !image ||
    securityGroups.includes(undefined) ||
    storages.includes(undefined) ||
    nics.includes(undefined)
  ) {
    console.warn(
      `Failed to create VM due to missing resources. node: ${node}, image: ${image}, securityGroups: ${securityGroups}, storages: ${storages}, nics: ${nics}`
    );
    return undefined;
  }
  const newVm: VirtualMachineResponse = {
    id: crypto.randomUUID(),
    name: data.name,
    status: "running",
    node: node,
    createdAt: new Date().toISOString(),
    securityGroups: securityGroups as SecurityGroupResponse[],
    storages: storages as StorageResponse[],
    networkInterfaces: nics as NetworkInterfaceResponse[],
    cpuUtilization: Math.random(),
    memoryUtilization: Math.random(),
    storageUtilization: Math.random(),
    cpuCore: cpuCore!,
    memorySize: memorySize!,
  };
  list().push(newVm);
  return newVm;
};

const update = (
  id: string,
  data: VirtualMachinePatchRequest | VirtualMachinePutRequest
): VirtualMachineResponse | undefined => {
  const vm = getById(id);
  if (!vm) {
    return undefined;
  }
  vm.name = data.name ?? vm.name;

  return vm;
};

const deleteById = (id: string): boolean => {
  const index = list().findIndex((vm) => vm.id === id);
  if (index === -1) {
    return false;
  }
  list().splice(index, 1);
  return true;
};

const listNetworkInterfacesByVirtualMachineId = (
  id: string
): NetworkInterfaceResponse[] | undefined => {
  const vm = getById(id);
  return vm?.networkInterfaces;
};

const getNetworkInterface = (
  vmId: string,
  nicId: string
): NetworkInterfaceResponse | undefined => {
  const nics = listNetworkInterfacesByVirtualMachineId(vmId);
  return nics?.find((nic) => nic.id === nicId);
};

const createNetworkInterface = (
  vmId: string,
  data: NetworkInterfaceCreateRequest
): NetworkInterfaceResponse | undefined => {
  const nics = listNetworkInterfacesByVirtualMachineId(vmId);
  if (!nics) {
    return undefined;
  }
  const subnet = VirtualNetworkRepository.getSubnetById(data.subnetId);
  if (!subnet) {
    return undefined;
  }
  const newNic: NetworkInterfaceResponse = {
    id: crypto.randomUUID(),
    name: data.name,
    macAddress: "52:54:00:ab:cd:ef",
    ipAddress: "10.0.0.10",
    subnet: subnet,
  };
  nics.push(newNic);
  return newNic;
};

const updateNetworkInterface = (
  vmId: string,
  nicId: string,
  data: NetworkInterfacePatchRequest | NetworkInterfacePutRequest
): NetworkInterfaceResponse | undefined => {
  const target = getNetworkInterface(vmId, nicId);
  if (!target) {
    return undefined;
  }
  target.name = data.name ?? target.name;
  if (data.subnetId) {
    const subnet = VirtualNetworkRepository.getSubnetById(data.subnetId);
    if (subnet) {
      target.subnet = subnet;
    } else {
      return undefined;
    }
  }
  return target;
};

const deleteNetworkInterface = (vmId: string, nicId: string): boolean => {
  const nics = listNetworkInterfacesByVirtualMachineId(vmId);
  if (!nics) {
    return false;
  }
  const index = nics.findIndex((nic) => nic.id === nicId);
  if (index === -1) {
    return false;
  }
  nics.splice(index, 1);
  return true;
};

const listStoragesByVirtualMachineId = (
  id: string
): StorageResponse[] | undefined => {
  const vm = getById(id);
  return vm?.storages;
};

const getStorage = (
  vmId: string,
  storageId: string
): StorageResponse | undefined => {
  const storages = listStoragesByVirtualMachineId(vmId);
  return storages?.find((storage) => storage.id === storageId);
};

const createStorage = (
  vmId: string,
  data: StorageCreateRequest
): StorageResponse | undefined => {
  const vm = getById(vmId);
  if (!vm) {
    return undefined;
  }
  const pool = StoragePoolRepository.getById(data.poolId);
  if (!pool) {
    return undefined;
  }
  const newStorage: StorageResponse = {
    id: crypto.randomUUID(),
    name: data.name,
    size: data.size,
    pool: pool,
    createdAt: new Date().toISOString(),
    devicePath: "/dev/sdX",
  };
  vm.storages.push(newStorage);
  return newStorage;
};

const updateStorage = (
  vmId: string,
  storageId: string,
  data: StoragePatchRequest | StoragePutRequest
): StorageResponse | undefined => {
  const target = getStorage(vmId, storageId);
  if (!target) {
    return undefined;
  }
  target.name = data.name ?? target.name;

  return target;
};

const deleteStorage = (vmId: string, storageId: string): boolean => {
  const storages = listStoragesByVirtualMachineId(vmId);
  if (!storages) {
    return false;
  }
  const index = storages.findIndex((storage) => storage.id === storageId);
  if (index === -1) {
    return false;
  }
  storages.splice(index, 1);
  return true;
};

const listSecurityGroupsByVirtualMachineId = (
  id: string
): SecurityGroupResponse[] | undefined => {
  const vm = getById(id);
  return vm?.securityGroups;
};

const addSecurityGroupToVm = (
  vmId: string,
  data: VmSecurityGroupAddRequest
): SecurityGroupResponse | undefined => {
  const vm = getById(vmId);
  if (!vm) {
    return undefined;
  }
  const sg = SecurityGroupRepository.getById(data.securityGroupId);
  if (!sg) {
    return undefined;
  }
  // すでに追加されていれば無視
  if (vm.securityGroups.find((s) => s.id === sg.id)) {
    return sg;
  }
  vm.securityGroups.push(sg);
  return sg;
};

const deleteSecurityGroupFromVm = (
  vmId: string,
  securityGroupId: string
): boolean => {
  const vm = getById(vmId);
  if (!vm) {
    return false;
  }
  const index = vm.securityGroups.findIndex((sg) => sg.id === securityGroupId);
  if (index === -1) {
    return false;
  }
  vm.securityGroups.splice(index, 1);
  return true;
};

export const VirtualMachineRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  listNetworkInterfacesByVirtualMachineId,
  getNetworkInterface,
  createNetworkInterface,
  updateNetworkInterface,
  deleteNetworkInterface,
  listStoragesByVirtualMachineId,
  getStorage,
  createStorage,
  updateStorage,
  deleteStorage,
  listSecurityGroupsByVirtualMachineId,
  addSecurityGroupToVm,
  deleteSecurityGroupFromVm,
};

export default VirtualMachineRepository;
