import { getDevices } from "../../../services/NodeService";
import { z } from "zod";

export default defineEventHandler(async (event) => {
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
  // これモックなので、常に同じデバイスリストを返す
  const devices = getDevices();

  return devices;
});
