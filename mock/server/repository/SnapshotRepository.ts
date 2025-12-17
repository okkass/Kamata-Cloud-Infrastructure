import type {
  SnapshotResponse,
  SnapshotCreateRequest,
  SnapshotPatchRequest,
  SnapshotPutRequest,
} from "@app/shared/types";
import crypto from "crypto";

import { VirtualMachineRepository } from "./VirtualMachineRepository";

let snapshots: Array<SnapshotResponse> | null = null;

const initSnapshots = (): Array<SnapshotResponse> => {
  return [
    {
      id: "aa42d8e3-9fa4-4f49-a91d-1ca9564d2aca",
      name: "VM-01-snapshot",
      description: "First snapshot",
      createdAt: new Date().toISOString(),
      targetVirtualMachine: VirtualMachineRepository.getById(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )!,
    },
    {
      id: "b1828e68-f352-470d-961a-e57c4109dbf8",
      name: "VM-01-snapshot-2",
      description: "First snapshot",
      createdAt: new Date().toISOString(),
      targetVirtualMachine: VirtualMachineRepository.getById(
        "fd8467e4-f334-4827-bf69-79d6434a176e"
      )!,
    },
    {
      id: "216803d2-52ee-4a5d-b40e-afc0afb41e4e",
      name: "VM-02-snapshot",
      description: "First snapshot",
      createdAt: new Date().toISOString(),
      targetVirtualMachine: VirtualMachineRepository.getById(
        "fa7a4b5f-bd6a-42da-a1de-e12d26459377"
      )!,
    },
  ];
};

const list = (): Array<SnapshotResponse> => {
  if (!snapshots) {
    snapshots = initSnapshots();
  }
  return snapshots;
};

const getById = (id: string): SnapshotResponse | undefined => {
  return list().find((snapshot) => snapshot.id === id);
};

const create = (
  request: SnapshotCreateRequest
): SnapshotResponse | undefined => {
  const vm = VirtualMachineRepository.getById(request.targetVmId);
  if (!vm) {
    return undefined;
  }
  const newSnapshot: SnapshotResponse = {
    id: crypto.randomUUID(),
    name: request.name,
    description: request.description,
    createdAt: new Date().toISOString(),
    targetVirtualMachine: vm,
  };
  list().push(newSnapshot);
  return newSnapshot;
};

const update = (
  id: string,
  updateFields: SnapshotPatchRequest | SnapshotPutRequest
): SnapshotResponse | undefined => {
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
  snapshots = list().filter((snapshot) => snapshot.id !== id);
  return list().length < initialLength;
};

const restore = (id: string): boolean => {
  const snapshot = getById(id);
  if (snapshot === undefined) {
    return false;
  }
  // ほんとはここで失敗したら別の例外を投げたり
  // Mock implementation: In a real scenario, this would involve more complex logic.
  console.log(
    `Restoring virtual machine ${snapshot.targetVirtualMachine.id} from snapshot ${id}`
  );
  return true;
};

export const SnapshotRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  restore,
};

export default SnapshotRepository;
