import { getBackups } from "../../services/backupService";

export default defineEventHandler(() => {
  return getBackups();
});
