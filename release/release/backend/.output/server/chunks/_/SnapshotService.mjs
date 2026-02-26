import require$$1 from 'crypto';
import { V as VirtualMachineRepository } from './VirtualMachineRepository.mjs';

let snapshots = null;
const initSnapshots = () => {
  return [
    {
      id: "aa42d8e3-9fa4-4f49-a91d-1ca9564d2aca",
      name: "VM-01-snapshot",
      description: "First snapshot",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      targetVirtualMachine: VirtualMachineRepository.getById(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )
    },
    {
      id: "b1828e68-f352-470d-961a-e57c4109dbf8",
      name: "VM-01-snapshot-2",
      description: "First snapshot",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      targetVirtualMachine: VirtualMachineRepository.getById(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )
    },
    {
      id: "216803d2-52ee-4a5d-b40e-afc0afb41e4e",
      name: "VM-02-snapshot",
      description: "First snapshot",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      targetVirtualMachine: VirtualMachineRepository.getById(
        "fa7a4b5f-bd6a-42da-a1de-e12d26459377"
      )
    }
  ];
};
const list = () => {
  if (!snapshots) {
    snapshots = initSnapshots();
  }
  return snapshots;
};
const getById = (id) => {
  return list().find((snapshot) => snapshot.id === id);
};
const create = (request) => {
  const vm = VirtualMachineRepository.getById(request.targetVmId);
  if (!vm) {
    return void 0;
  }
  const newSnapshot = {
    id: require$$1.randomUUID(),
    name: request.name,
    description: request.description,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    targetVirtualMachine: vm
  };
  list().push(newSnapshot);
  return newSnapshot;
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
  snapshots = list().filter((snapshot) => snapshot.id !== id);
  return list().length < initialLength;
};
const restore = (id) => {
  const snapshot = getById(id);
  if (snapshot === void 0) {
    return false;
  }
  console.log(
    `Restoring virtual machine ${snapshot.targetVirtualMachine.id} from snapshot ${id}`
  );
  return true;
};
const SnapshotRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  restore
};

const getSnapshotService = (permission) => {
  const SnapshotService = {
    list(query) {
      const snapshots = SnapshotRepository.list();
      return { success: true, data: snapshots };
    },
    getById(id) {
      const snapshot = SnapshotRepository.getById(id);
      if (!snapshot) {
        return {
          success: false,
          error: "NotFound"
        };
      }
      return { success: true, data: snapshot };
    },
    create(data) {
      const newSnapshot = SnapshotRepository.create(data);
      if (!newSnapshot) {
        return {
          success: false,
          error: "BadRequest"
        };
      }
      return { success: true, data: newSnapshot };
    },
    update(id, data) {
      const updatedSnapshot = SnapshotRepository.update(id, data);
      if (!updatedSnapshot) {
        return {
          success: false,
          error: "NotFound"
        };
      }
      return { success: true, data: updatedSnapshot };
    },
    delete(id) {
      const deleted = SnapshotRepository.deleteById(id);
      if (!deleted) {
        return { success: false, error: "NotFound" };
      }
      return { success: true, data: null };
    }
  };
  return SnapshotService;
};

export { getSnapshotService as g };
//# sourceMappingURL=SnapshotService.mjs.map
