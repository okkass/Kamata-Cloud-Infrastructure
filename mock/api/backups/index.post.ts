import { backupService } from "../../services/backupService";
import { backupCreateSchema } from "@/schemas/backupSchemas";
import { validateBody } from "@utils/validate";
import type { BackupCreateRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  // リクエストボディの読み取り
  const body = (await readBody<BackupCreateRequest>(
    event
  )) as BackupCreateRequest;
  // バリデーションの実行
  const validateRes = validateBody<BackupCreateRequest>(
    body,
    backupCreateSchema
  );
  // バリデーションエラー時の処理
  if (!validateRes.success) {
    setResponseStatus(event, validateRes.error.status);
    return validateRes.error;
  }
  // バックアップ作成のサービス呼び出し
  const result = backupService.create(validateRes.data);
  // レスポンスステータスの設定と結果の返却
  if (!result.success) {
    setResponseStatus(event, result.status ?? 500);
    return result.error;
  }
  // 成功時の処理
  setResponseStatus(event, result.status ?? 201);
  return result.data;
});
