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
