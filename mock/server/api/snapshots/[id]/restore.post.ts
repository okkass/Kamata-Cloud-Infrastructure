import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.uuid();

  const id = event.context.params?.id;
  const res = paramsSchema.safeParse(id);
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }
  setResponseStatus(event, 202);
  // モックなので成功レスポンスを返すだけ
  return {
    status: "success",
    message: "Snapshot restore started",
  };
});
