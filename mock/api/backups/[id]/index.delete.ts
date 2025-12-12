import { backupService } from "../../../services/backupService";
import { validateUuid } from "@utils/validate";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const idRes = validateUuid(id);
  if (!idRes.success) {
    setResponseStatus(event, idRes.error.status);
    return idRes.error;
  }
  const backupId = idRes.data;
  const res = backupService.remove(backupId);
  if (!res.success) {
    setResponseStatus(event, res.status ?? 500);
    return res.error;
  }
  setResponseStatus(event, res.status ?? 200);
  return res.data;
});
