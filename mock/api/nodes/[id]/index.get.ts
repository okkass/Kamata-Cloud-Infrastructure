import { z } from "zod";
import { getNodeById } from "../../../services/nodeService";

export default defineEventHandler(async (event) => {
  const querySchema = z.uuid();
  const res = querySchema.safeParse(event.context.params?.id);

  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }

  const nodeId = res.data;
  const node = getNodeById(nodeId);
  if (!node) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Node not found",
      status: 404,
    };
  }
  return node;
});
