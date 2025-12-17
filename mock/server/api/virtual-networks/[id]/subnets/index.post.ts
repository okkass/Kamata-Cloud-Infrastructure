import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSubnetService } from "@/service/VirtualNetworkService";
import { validateUUID } from "@/utils/validate";
import { createSubnetSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  // パスパラメータから仮想ネットワークIDを取得・バリデート
  const vnId = validateUUID(event.context.params?.id);
  // リクエストボディを取得
  const requestBody = await readBody(event);

  // リクエストから権限情報を取り出す
  const permission = getPermissionFromEvent(event);

  const service = getSubnetService(permission, vnId);

  // サービスの create 処理を共通ハンドラー経由で実行しレスポンスを返す
  return createResource(requestBody, createSubnetSchema, service.create);
});
