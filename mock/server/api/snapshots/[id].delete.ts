import { z } from "zod";
// import { deleteSnapshot } from "../../../services/snapshotService"; // サービスが存在しないためコメントアウトまたはモック

export default defineEventHandler(async (event) => {
  const paramsSchema = z.string().uuid();

  const id = getRouterParam(event, "id");
  const res = paramsSchema.safeParse(id);
  if (!res.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
      data: z.treeifyError(res.error).errors.join(", "),
    });
  }

  const snapshotId = res.data;

  // 実際の削除ロジック（モック）
  // const deleted = deleteSnapshot(snapshotId);
  const deleted = true; // 常に成功と仮定

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Snapshot not found",
    });
  }

  console.log(`[Mock] Snapshot deleted: ${snapshotId}`);
  return { message: "Snapshot deleted" };
});
