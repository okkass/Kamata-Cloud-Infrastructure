import { deleteNode } from "../../../services/nodeService";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const querySchema = z.uuid();

  const id = event.context.params?.id;
  const res = querySchema.safeParse(id);
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid UUID",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }
  const deleted = deleteNode(res.data);
  if (!deleted) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Node not found",
      status: 404,
    };
  }
  event.node.res.statusCode = 204;
  return;
});
