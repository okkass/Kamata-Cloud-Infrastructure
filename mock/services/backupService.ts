import type {
  BackupResponse,
  BackupCreateRequest,
  BackupPatchRequest,
  BackupPutRequest,
} from "@app/shared/types";

import {
  getVirtualMachineById,
  getStorageByVirtualMachineId,
  getStorage,
} from "./virtualMachineService";

import crypto from "crypto";

let backups: Array<BackupResponse> | null = null;

export const initBackups = (): Array<BackupResponse> => {
  return [
    {
      id: "b6a12898-1a61-4584-9cba-4e89e1fdf23b",
      name: "Vm-01-backup-2024-05-01",
      description: "バックアップ元のVM現存パターン",
      createdAt: new Date().toISOString(),
      size: 100 * 1024 * 1024 * 1024, // 100 GB
      targetStorage: getStorageByVirtualMachineId(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )![1],
      targetVirtualMachine: getVirtualMachineById(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )!,
    },
    {
      id: "8b0975a9-9ecc-46f1-896a-d0c6a92d3736",
      name: "Vm-00-No-Machine-backup-2024-05-01",
      description: "バックアップ元のVMが削除済みパターン",
      createdAt: new Date().toISOString(),
      size: 80 * 1024 * 1024 * 1024, // 80 GB
    },
  ];
};

export const getBackups = (): Array<BackupResponse> => {
  if (!backups) {
    backups = initBackups();
  }
  return backups;
};

export const getBackupById = (id: string): BackupResponse | undefined => {
  return getBackups().find((backup) => backup.id === id);
};

export const addBackup = (
  backup: BackupCreateRequest
): BackupResponse | undefined => {
  const uuid = crypto.randomUUID();
  const storage = getStorage(
    backup.targetStorageId,
    backup.targetVirtualMachineId
  );
  if (!storage) {
    return undefined;
  }

  const newBackup: BackupResponse = {
    id: uuid,
    name: backup.name,
    description: backup.description,
    createdAt: new Date().toISOString(),
    size: storage.size,
    targetStorage: storage,
    targetVirtualMachine: getVirtualMachineById(backup.targetVirtualMachineId)!,
  };
  getBackups().push(newBackup);
  return newBackup;
};

export const updateBackup = (
  id: string,
  updateFields: BackupPatchRequest | BackupPutRequest
): BackupResponse | undefined => {
  let target = getBackupById(id);
  if (target === undefined) {
    return undefined;
  }

  target.name = updateFields.name ?? target.name;
  target.description = updateFields.description ?? target.description;

  return target;
};

export const deleteBackup = (id: string): boolean => {
  const initialLength = getBackups().length;
  backups = getBackups().filter((backup) => backup.id !== id);
  return getBackups().length < initialLength;
};
