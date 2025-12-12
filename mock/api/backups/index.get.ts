// サービスのインポート
import { backupService } from "../../services/backupService";

export default defineEventHandler(async (event) => {
  // バックアップのリストを取得
  const result = backupService.list();
  // レスポンスステータスの設定
  setResponseStatus(event, result.status ?? (result.success ? 200 : 500));
  // 成功しなかった場合はエラーを返す
  if (!result.success) {
    return result.error;
  }
  // 成功した場合はデータを返す
  return result.data;
});
