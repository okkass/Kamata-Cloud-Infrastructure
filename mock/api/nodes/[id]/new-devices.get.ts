import { getDevices } from "../../../services/nodeService";
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
  // これモックなので、常に同じデバイスリストを返す
  const devices = getDevices();

  return devices;
});
