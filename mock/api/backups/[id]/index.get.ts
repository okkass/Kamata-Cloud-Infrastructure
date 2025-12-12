import { backupService } from "../../../services/backupService";
import { validateUuid } from "@utils/validate";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const uuidValidation = validateUuid(id as string);
  if (!uuidValidation.success) {
    setResponseStatus(event, uuidValidation.error.status);
    return uuidValidation.error;
  }

  const result = backupService.get(uuidValidation.data);
  if (!result.success) {
    setResponseStatus(event, result.status ?? 500);
    return result.error;
  }
  setResponseStatus(event, result.status ?? 200);
  return result.data;
});
