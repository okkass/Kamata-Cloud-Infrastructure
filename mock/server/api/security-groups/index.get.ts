import { getSecurityGroups } from "@/services/securityGroupService";

export default defineEventHandler(() => {
  return getSecurityGroups();
});
