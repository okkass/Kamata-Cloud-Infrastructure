import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";

export default defineEventHandler((event) => {
  // モックなので固定のユーザーを返す
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);

  const list = getResourceList(service.list);
  return list[0];
});
