import { z } from "zod";
import type { NodeCreateRequest } from "@app/shared/types";
import { addNode } from "../../services/nodeService";

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    ipAddress: z.ipv4(),
    rootPassword: z.string().min(8).max(64),
    name: z.string().min(3).max(50).optional(),
    isAdmin: z.boolean().optional(),
  });

  const res = bodySchema.safeParse(await readBody<NodeCreateRequest>(event));
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }

  const data = res.data as NodeCreateRequest;

  console.log("Adding node:", data);

  const newNode = addNode(data);

  event.node.res.statusCode = 201;
  return newNode;
});
