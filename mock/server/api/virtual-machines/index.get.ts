import { getVirtualMachines } from "@/services/virtualMachineService";

export default defineEventHandler(async (event) => {
  return getVirtualMachines();
});
