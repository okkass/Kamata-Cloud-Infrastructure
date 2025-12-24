import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualNetworkService } from "@@/server/service/VirtualNetworkService";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler((event) => {
  // パスパラメータから仮想ネットワークIDを取得・バリデート
  const vnId = validateUUID(event.context.params?.id);

  // リクエストから権限情報を取り出す
  const permission = getPermissionFromEvent(event);

  const service = getVirtualNetworkService(permission).getSubnetService(vnId);

  // サービスの list 処理を共通ハンドラー経由で実行しレスポンスを返す
  return getResourceList(service.list);
});
