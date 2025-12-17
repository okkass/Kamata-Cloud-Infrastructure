import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getBackupService } from "@/service/BackupService";

export default defineEventHandler((event) => {
  // リクエストから権限情報を取り出す
  const permission = getPermissionFromEvent(event);
  // 権限に応じたバックアップサービスを生成
  const service = getBackupService(permission);

  // サービスの list 処理を共通ハンドラー経由で実行しレスポンスを返す
  return getResourceList(service.list);
});
