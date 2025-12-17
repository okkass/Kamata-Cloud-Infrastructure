import type { UserPermissions } from "@/types";

export default defineEventHandler((event) => {
  const permission: UserPermissions = {
    id: "8f8ec727-09dc-43ba-ae67-92fe9019a523",
    isAdmin: true,
    isImageAdmin: true,
    isInstanceTypeAdmin: true,
    isNetworkAdmin: true,
    isNodeAdmin: true,
    isSecurityGroupAdmin: true,
    isVirtualMachineAdmin: true,
  };

  event.context.user = permission;
});
