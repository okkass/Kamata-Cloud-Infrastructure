import type { VirtualMachineWithInstanceTypeDTO } from "./VirtualMachineWithInstanceTypeDTO";
import type { VirtualMachineWithCustomConfigDTO } from "./VirtualMachineWithCustomConfigDTO";
export type VirtualMachineDTO =
  | VirtualMachineWithInstanceTypeDTO
  | VirtualMachineWithCustomConfigDTO;

export const VirtualMachineStatusEnum = {
  Running: "running",
  Stopped: "stopped",
  Suspended: "suspended",
  Error: "error",
  Pending: "pending",
} as const;

export type VirtualMachineStatusEnum =
  (typeof VirtualMachineStatusEnum)[keyof typeof VirtualMachineStatusEnum];
