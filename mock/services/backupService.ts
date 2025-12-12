import type {
  BackupResponse,
  BackupCreateRequest,
  BackupPatchRequest,
  BackupPutRequest,
  VirtualMachineResponse,
} from "@app/shared/types";

import type { ServiceResult } from "./common";

import {
  getVirtualMachineById,
  getStoragesByVirtualMachineId,
  getStorage,
} from "./virtualMachineService";
import { create400Error, create404Error, create500Error } from "@utils/errors";

import crypto from "crypto";

export class StorageNotFoundError extends Error {}
export class VirtualMachineNotFoundError extends Error {}

let backups: Array<BackupResponse> | null = null;

export const initBackups = (): Array<BackupResponse> => {
  return [
    {
      id: "b6a12898-1a61-4584-9cba-4e89e1fdf23b",
      name: "Vm-01-backup-2024-05-01",
      description: "バックアップ元のVM現存パターン",
      createdAt: new Date().toISOString(),
      size: 100 * 1024 * 1024 * 1024, // 100 GB
      targetStorage: getStoragesByVirtualMachineId(
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

const getBackups = (): Array<BackupResponse> => {
  if (!backups) {
    backups = initBackups();
  }
  return backups;
};

const getBackupById = (id: string): BackupResponse | undefined => {
  return getBackups().find((backup) => backup.id === id);
};

const addBackup = (backup: BackupCreateRequest): BackupResponse | undefined => {
  const uuid = crypto.randomUUID();
  const storage = getStorage(
    backup.targetStorageId,
    backup.targetVirtualMachineId
  );
  if (!storage) {
    throw new StorageNotFoundError("Storage not found");
  }

  const vm = getVirtualMachineById(backup.targetVirtualMachineId);
  if (!vm) {
    throw new VirtualMachineNotFoundError("Virtual machine not found");
  }

  const newBackup: BackupResponse = {
    id: uuid,
    name: backup.name,
    description: backup.description,
    createdAt: new Date().toISOString(),
    size: storage.size,
    targetStorage: storage,
    targetVirtualMachine: vm,
  };
  getBackups().push(newBackup);
  return newBackup;
};

const updateBackup = (
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

const deleteBackup = (id: string): boolean => {
  const initialLength = getBackups().length;
  backups = getBackups().filter((backup) => backup.id !== id);
  return getBackups().length < initialLength;
};

const list = (): ServiceResult<Array<BackupResponse>> => {
  // ここで例外ベースのエラーハンドリングを実装可能（例外はServiceResultのerrorに変換される）
  return { success: true, data: getBackups() };
};

const get = (id: string): ServiceResult<BackupResponse> => {
  const backup = getBackupById(id);
  if (!backup) {
    return {
      success: false,
      error: create404Error("Backup not found"),
      status: 404,
    };
  }
  return { success: true, data: backup };
};

// 例外はここで食い止めてServiceResultのerrorに変換する
const create = (backup: BackupCreateRequest): ServiceResult<BackupResponse> => {
  try {
    const newBackup = addBackup(backup);
    if (!newBackup) {
      return {
        success: false,
        error: create500Error("Failed to create backup"),
        status: 500,
      };
    }
    return { success: true, data: newBackup, status: 201 };
  } catch (error) {
    if (error instanceof StorageNotFoundError) {
      return {
        success: false,
        error: create400Error("Target storage not found"),
        status: 400,
      };
    }
    if (error instanceof VirtualMachineNotFoundError) {
      return {
        success: false,
        error: create400Error("Target virtual machine not found"),
        status: 400,
      };
    }
    return {
      success: false,
      error: create500Error("Failed to create backup"),
      status: 500,
    };
  }
};

const update = (
  id: string,
  updateFields: BackupPatchRequest | BackupPutRequest
): ServiceResult<BackupResponse> => {
  const updatedBackup = updateBackup(id, updateFields);
  if (!updatedBackup) {
    return {
      success: false,
      error: create404Error("Backup not found"),
      status: 404,
    };
  }
  return { success: true, data: updatedBackup };
};

const remove = (id: string): ServiceResult<null> => {
  const deleted = deleteBackup(id);
  if (!deleted) {
    return {
      success: false,
      error: create404Error("Backup not found"),
      status: 404,
    };
  }
  return { success: true, data: null, status: 204 };
};

const restore = (id: string): ServiceResult<VirtualMachineResponse> => {
  const backup = getBackupById(id);
  if (!backup) {
    return {
      success: false,
      error: create404Error("Backup not found"),
      status: 404,
    };
  }

  if (!backup.targetVirtualMachine || !backup.targetStorage) {
    return {
      success: false,
      error: create400Error(
        "Backup元の仮想マシンが存在しないため、復元できません。"
      ),
      status: 400,
    };
  }

  return {
    success: true,
    data: backup.targetVirtualMachine as VirtualMachineResponse,
  };
};

export const backupService = {
  list,
  get,
  create,
  update,
  remove,
  restore,
};
