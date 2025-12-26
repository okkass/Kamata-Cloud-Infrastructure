import { getResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualNetworkService } from "@@/server/service/VirtualNetworkService";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler((event) => {
  // パスパラメータから仮想ネットワークIDを取得・バリデート
  const vnId = validateUUID(event.context.params?.id);

  // eventから権限情報を取り出す
  const permission = getPermissionFromEvent(event);

  const service = getVirtualNetworkService(permission).getSubnetService(vnId);

  const id = event.context.params?.subnetId || "";

  return getResource(id, service.getById);
});
