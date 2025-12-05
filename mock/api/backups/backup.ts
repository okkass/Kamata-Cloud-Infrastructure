import type { BackupResponse } from "@/types/api-types";
import { v4 as uuidv4 } from "uuid";

let backups: Array<BackupResponse> = [];

export const getBackups = (): Array<BackupResponse> => {
  return backups;
};

export const getBackupById = (id: string): BackupResponse | undefined => {
  return backups.find((backup) => backup.id === id);
};
