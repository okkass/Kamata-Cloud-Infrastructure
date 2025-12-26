import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getUserService } from "@@/server/service/UserService";

export default defineEventHandler((event) => {
  // モックなので固定のユーザーを返す
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);

  const list = getResourceList(service.list);
  return list[0];
});
