import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSubnetService } from "@/service/VirtualNetworkService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler((event) => {
  // パスパラメータから仮想ネットワークIDを取得・バリデート
  const vnId = validateUUID(event.context.params?.id);

  // eventから権限情報を取り出す
  const permission = getPermissionFromEvent(event);

  const service = getSubnetService(permission, vnId);

  const id = event.context.params?.subnetId || "";

  return getResource(id, service.getById);
});
