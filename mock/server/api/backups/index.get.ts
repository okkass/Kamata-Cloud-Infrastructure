import { getBackups } from "../../services/BackupService";

export default defineEventHandler(() => {
  return getBackups();
});
