import type {
  BackupResponse,
  BackupCreateRequest,
  BackupPatchRequest,
  BackupPutRequest,
} from "@app/shared/types";

import { VirtualMachineRepository } from "./VirtualMachineRepository";

import crypto from "crypto";

let backups: Array<BackupResponse> | null = null;

const initBackups = (): Array<BackupResponse> => {
  return [
    {
      id: "b6a12898-1a61-4584-9cba-4e89e1fdf23b",
      name: "Vm-01-backup-2024-05-01",
      description: "バックアップ元のVM現存パターン",
      createdAt: new Date().toISOString(),
      size: 100 * 1024 * 1024 * 1024, // 100 GB
      targetStorage: VirtualMachineRepository.listStoragesByVirtualMachineId(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )![1],
      targetVirtualMachine: VirtualMachineRepository.getById(
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

const list = (): Array<BackupResponse> => {
  if (!backups) {
    backups = initBackups();
  }
  return backups;
};

const getById = (id: string): BackupResponse | undefined => {
  return list().find((backup) => backup.id === id);
};

const create = (backup: BackupCreateRequest): BackupResponse | undefined => {
  const storage = VirtualMachineRepository.getStorage(
    backup.targetVirtualMachineId,
    backup.targetStorageId
  );
  if (!storage) {
    return undefined;
  }

  const newBackup: BackupResponse = {
    id: crypto.randomUUID(),
    name: backup.name,
    description: backup.description,
    createdAt: new Date().toISOString(),
    size: storage.size,
    targetStorage: storage,
    targetVirtualMachine: VirtualMachineRepository.getById(
      backup.targetVirtualMachineId
    )!,
  };
  list().push(newBackup);
  return newBackup;
};

const update = (
  id: string,
  updateFields: BackupPatchRequest | BackupPutRequest
): BackupResponse | undefined => {
  let target = getById(id);
  if (target === undefined) {
    return undefined;
  }

  target.name = updateFields.name ?? target.name;
  target.description = updateFields.description ?? target.description;

  return target;
};

const deleteById = (id: string): boolean => {
  const initialLength = list().length;
  backups = list().filter((backup) => backup.id !== id);
  return list().length < initialLength;
};

export const BackupRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};
