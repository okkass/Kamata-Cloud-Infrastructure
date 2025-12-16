import { getVirtualMachines } from "@/services/VirtualMachineService";

export default defineEventHandler(async (event) => {
  return getVirtualMachines();
});
