import { V as VirtualMachineRepository } from './VirtualMachineRepository.mjs';
import require$$1 from 'crypto';

let backups = null;
const initBackups = () => {
  return [
    {
      id: "b6a12898-1a61-4584-9cba-4e89e1fdf23b",
      name: "Vm-01-backup-2024-05-01",
      description: "\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u5143\u306EVM\u73FE\u5B58\u30D1\u30BF\u30FC\u30F3",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      size: 100 * 1024 * 1024 * 1024,
      // 100 GB
      targetStorage: VirtualMachineRepository.listStoragesByVirtualMachineId(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )[1],
      targetVirtualMachine: VirtualMachineRepository.getById(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )
    },
    {
      id: "8b0975a9-9ecc-46f1-896a-d0c6a92d3736",
      name: "Vm-00-No-Machine-backup-2024-05-01",
      description: "\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u5143\u306EVM\u304C\u524A\u9664\u6E08\u307F\u30D1\u30BF\u30FC\u30F3",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      size: 80 * 1024 * 1024 * 1024
      // 80 GB
    }
  ];
};
const list = () => {
  if (!backups) {
    backups = initBackups();
  }
  return backups;
};
const getById = (id) => {
  return list().find((backup) => backup.id === id);
};
const create = (backup) => {
  const storage = VirtualMachineRepository.getStorage(
    backup.targetVirtualMachineId,
    backup.targetStorageId
  );
  if (!storage) {
    return void 0;
  }
  const newBackup = {
    id: require$$1.randomUUID(),
    name: backup.name,
    description: backup.description,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    size: storage.size,
    targetStorage: storage,
    targetVirtualMachine: VirtualMachineRepository.getById(
      backup.targetVirtualMachineId
    )
  };
  list().push(newBackup);
  return newBackup;
};
const update = (id, updateFields) => {
  var _a, _b;
  let target = getById(id);
  if (target === void 0) {
    return void 0;
  }
  target.name = (_a = updateFields.name) != null ? _a : target.name;
  target.description = (_b = updateFields.description) != null ? _b : target.description;
  return target;
};
const deleteById = (id) => {
  const initialLength = list().length;
  backups = list().filter((backup) => backup.id !== id);
  return list().length < initialLength;
};
const BackupRepository = {
  list,
  getById,
  create,
  update,
  deleteById
};

const getBackupService = (permission) => {
  const BackupService = {
    list(query) {
      const backups = BackupRepository.list();
      return { success: true, data: backups };
    },
    getById(id) {
      const backup = BackupRepository.getById(id);
      if (!backup) {
        return {
          success: false,
          error: "NotFound"
        };
      }
      return { success: true, data: backup };
    },
    create(data) {
      const newBackup = BackupRepository.create(data);
      if (!newBackup) {
        return {
          success: false,
          error: "BadRequest"
        };
      }
      return { success: true, data: newBackup };
    },
    update(id, data) {
      const updatedBackup = BackupRepository.update(id, data);
      if (!updatedBackup) {
        return {
          success: false,
          error: "NotFound"
        };
      }
      return { success: true, data: updatedBackup };
    },
    delete(id) {
      const deleted = BackupRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound"
        };
      }
      return { success: true, data: null };
    },
    restore(backupId) {
      return { success: true, data: "Accepted" };
    }
  };
  return BackupService;
};

export { getBackupService as g };
//# sourceMappingURL=BackupService.mjs.map
