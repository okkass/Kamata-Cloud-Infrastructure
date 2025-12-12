import { z } from "zod";
import { updateNode } from "../../../services/nodeService";
import type { NodePatchRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    name: z.string().min(1).max(50).optional(),
    isAdmin: z.boolean().optional(),
  });

  const paramsSchema = z.uuid();

  const id = event.context.params?.id;
  const res = paramsSchema.safeParse(id);
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid UUID",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }
  const body = await readBody<NodePatchRequest>(event);
  const bodyRes = bodySchema.safeParse(body);
  if (!bodyRes.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(bodyRes.error).errors.join(", "),
      status: 400,
    };
  }

  const data = bodyRes.data as NodePatchRequest;
  const updatedNode = updateNode(res.data, data);
  if (!updatedNode) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Node not found",
      status: 404,
    };
  }
  return updatedNode;
});
