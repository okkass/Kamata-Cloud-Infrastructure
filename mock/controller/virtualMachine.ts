import type { VirtualMachineResponse } from "@app/shared/types";

let virtualMachines: Array<VirtualMachineResponse> = [];

export const getVirtualMachines = (): Array<VirtualMachineResponse> => {
  return virtualMachines;
};

export const getVirtualMachineById = (
  id: string
): VirtualMachineResponse | undefined => {
  return virtualMachines.find((vm) => vm.id === id);
};
