import { BackupResponse } from "@app/shared/types";

let backups: Array<BackupResponse> = [];

export const getBackups = (): Array<BackupResponse> => {
  return backups;
};

export const getBackupById = (id: string): BackupResponse | undefined => {
  return backups.find((backup) => backup.id === id);
};
