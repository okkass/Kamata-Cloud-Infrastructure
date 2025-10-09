import { VirtualMachineDTO } from "~~/shared/types";

export default defineEventHandler(() => {
  const state1: VirtualMachineDTO[] = [];
  const state2: VirtualMachineDTO[] = [
    {
      id: "c0b6f1a3-98e1-4959-9b47-7f0c7677ebe4",
      name: "web-server",
      status: "running",
      instanceType: {
        id: ""
      }
    },
  ];

  return state1;
});
