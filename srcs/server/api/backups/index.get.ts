import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getBackupService } from "@@/server/service/BackupService";

export default defineEventHandler((event) => {
  const { scope } = getQuery(event) as { scope?: string };
  if (scope !== undefined && scope !== "all" && scope !== "mine") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid scope parameter",
    });
  }
  // リクエストから権限情報を取り出す
  const permission = getPermissionFromEvent(event);
  // 権限に応じたバックアップサービスを生成
  const service = getBackupService(permission);

  // サービスの list 処理を共通ハンドラー経由で実行しレスポンスを返す
  return getResourceList(service.list);
});
