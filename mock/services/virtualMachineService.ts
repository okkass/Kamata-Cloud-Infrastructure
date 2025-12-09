import type {
  VirtualMachineResponse,
  NetworkInterfaceResponse,
  StorageResponse,
} from "@app/shared/types";
import { getNodeById } from "./nodesService";
import { getSecurityGroupById } from "./securityGroupService";
import { getStoragePoolById } from "./storagePoolService";

let virtualMachines: Array<VirtualMachineResponse> | null = null;

export const initVirtualMachines = (): Array<VirtualMachineResponse> => {
  return [
    {
      id: "fd8467e4-f334-4827-bf69-79d6434a176e",
      name: "VM-01",
      status: "running",
      node: getNodeById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
      createdAt: new Date().toISOString(),
      securityGroups: [
        getSecurityGroupById("81c210f6-8f8a-4554-9dd4-c58986827357")!,
      ],
      storages: [
        {
          id: "c695a74c-2afa-4eab-82fe-57628fa9b33b",
          name: "VM-01-os-disk",
          size: 24 * 1024 * 1024 * 1024, // 24 GB
          pool: getStoragePoolById("6b593061-0281-4ef1-8b63-96924137b878")!,
          createdAt: new Date().toISOString(),
          devicePath: "/dev/vda",
        },
        {
          id: "56623330-a52b-4aa7-8ed7-eb12ae07686c",
          name: "VM-01-data-disk",
          size: 100 * 1024 * 1024 * 1024, // 100 GB
          pool: getStoragePoolById("6b593061-0281-4ef1-8b63-96924137b878")!,
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
      node: getNodeById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
      createdAt: new Date().toISOString(),
      securityGroups: [
        getSecurityGroupById("81c210f6-8f8a-4554-9dd4-c58986827357")!,
      ],
      storages: [
        {
          id: "827a7dca-9eb8-46bf-a9c8-5f8d085424c8",
          name: "VM-02-os-disk",
          size: 24 * 1024 * 1024 * 1024, // 24 GB
          pool: getStoragePoolById("6b593061-0281-4ef1-8b63-96924137b878")!,
          createdAt: new Date().toISOString(),
          devicePath: "/dev/vda",
        },
        {
          id: "8cffb301-7f9f-4dcc-8e4d-7ec693631595",
          name: "VM-02-data-disk",
          size: 100 * 1024 * 1024 * 1024, // 100 GB
          pool: getStoragePoolById("6b593061-0281-4ef1-8b63-96924137b878")!,
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

export const getVirtualMachines = (): Array<VirtualMachineResponse> => {
  if (!virtualMachines) {
    virtualMachines = initVirtualMachines();
  }
  return virtualMachines!;
};

export const getVirtualMachineById = (
  id: string
): VirtualMachineResponse | undefined => {
  return getVirtualMachines().find((vm) => vm.id === id);
};

export const getNetworkInterfacesByVirtualMachineId = (
  id: string
): NetworkInterfaceResponse[] | undefined => {
  const vm = getVirtualMachineById(id);
  return vm?.networkInterfaces;
};

export const getNetworkInterface = (
  vmId: string,
  nicId: string
): NetworkInterfaceResponse | undefined => {
  const nics = getNetworkInterfacesByVirtualMachineId(vmId);
  return nics?.find((nic) => nic.id === nicId);
};

export const getStorageByVirtualMachineId = (
  id: string
): StorageResponse[] | undefined => {
  const vm = getVirtualMachineById(id);
  return vm?.storages;
};

export const getStorage = (
  storageId: string,
  vmId: string
): StorageResponse | undefined => {
  console.log("Getting storage with ID", storageId, "for VM ID", vmId);
  const storages = getStorageByVirtualMachineId(vmId);
  console.log("Storages for VM ID", vmId, ":", storages);
  console.log(storages?.find((storage) => storage.id === storageId));
  return storages?.find((storage) => storage.id === storageId);
};
