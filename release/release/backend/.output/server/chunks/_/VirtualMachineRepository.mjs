import { b as bytesToMb, m as mbToBytes } from './mathUtils.mjs';
import { a as getPrismaClient, P as PrismaClientKnownRequestError } from '../nitro/nitro.mjs';

const attachedStoragesArgs = {
  select: {
    path: true,
    virtualStorage: {
      select: {
        uuid: true,
        name: true,
        sizeMb: true,
        createdAt: true,
        storagePool: {
          select: {
            uuid: true
          }
        }
      }
    }
  }
};
const networkInterfaceArgs = {
  select: {
    id: true,
    uuid: true,
    name: true,
    ipAddress: true,
    macAddress: true,
    subnet: {
      select: {
        uuid: true,
        virtualNetwork: {
          select: {
            uuid: true
          }
        }
      }
    }
  }
};
const virtualMachineArgs = {
  select: {
    id: true,
    uuid: true,
    name: true,
    status: true,
    cpu: true,
    memoryMb: true,
    createdAt: true,
    attachedStorages: attachedStoragesArgs,
    networkInterfaces: networkInterfaceArgs,
    node: {
      select: {
        uuid: true
      }
    },
    user: {
      select: {
        uuid: true,
        name: true
      }
    },
    securityGroups: {
      select: {
        securityGroup: {
          select: {
            uuid: true
          }
        }
      }
    }
  }
};
const toStorageRecord = (record) => {
  return {
    id: record.virtualStorage.uuid,
    name: record.virtualStorage.name,
    sizeBytes: mbToBytes(record.virtualStorage.sizeMb),
    createdAt: record.virtualStorage.createdAt,
    poolId: record.virtualStorage.storagePool.uuid,
    devicePath: record.path
  };
};
const toNetworkInterfaceRecord = (record) => {
  return {
    id: record.uuid,
    name: record.name,
    ipAddress: record.ipAddress,
    macAddress: record.macAddress,
    subnetId: record.subnet.uuid,
    vnetId: record.subnet.virtualNetwork.uuid
  };
};
const toVirtualMachineRecord = (record) => {
  return {
    id: record.uuid,
    name: record.name,
    status: record.status,
    nodeId: record.node.uuid,
    createdAt: record.createdAt,
    owner: {
      id: record.user.uuid,
      name: record.user.name
    },
    securityGroupIds: record.securityGroups.map((sg) => sg.securityGroup.uuid),
    storages: record.attachedStorages.map(toStorageRecord),
    networkInterfaces: record.networkInterfaces.map(toNetworkInterfaceRecord),
    cpuCore: record.cpu,
    memoryBytes: mbToBytes(record.memoryMb)
  };
};
const VirtualMachineRepository = {
  list: async (userUuid) => {
    try {
      const prisma = getPrismaClient();
      let userId = void 0;
      if (userUuid) {
        const user = await prisma.user.findUnique({
          where: { uuid: userUuid },
          select: { id: true }
        });
        if (!user) {
          throw new Error("User not found");
        }
        userId = user.id;
      }
      const whereClause = userId ? { userId } : {};
      const records = await prisma.virtualMachine.findMany({
        where: whereClause,
        ...virtualMachineArgs
      });
      return {
        success: true,
        data: records.map(toVirtualMachineRecord)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  getById: async (id) => {
    try {
      const prisma = getPrismaClient();
      const record = await prisma.virtualMachine.findUnique({
        where: { uuid: id },
        ...virtualMachineArgs
      });
      if (!record) {
        return {
          success: true,
          data: null
        };
      }
      return {
        success: true,
        data: toVirtualMachineRecord(record)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  create: async (props) => {
    try {
      const prisma = getPrismaClient();
      const created = await prisma.virtualMachine.create({
        data: {
          name: props.name,
          status: "pending",
          cpu: props.cpu,
          memoryMb: bytesToMb(props.memoryBytes),
          node: {
            connect: {
              uuid: props.nodeId
            }
          },
          image: {
            connect: {
              uuid: props.imageId
            }
          },
          user: {
            connect: {
              uuid: props.userId
            }
          },
          networkInterfaces: {
            create: props.nics.map((nic) => ({
              name: nic.name,
              ipAddress: nic.ipAddress,
              macAddress: nic.macAddress,
              subnet: {
                connect: {
                  uuid: nic.subnetId
                }
              }
            }))
          },
          attachedStorages: {
            create: props.storages.map((storage) => ({
              path: storage.devicePath,
              virtualStorage: {
                create: {
                  name: storage.name,
                  sizeMb: bytesToMb(storage.sizeBytes),
                  storagePool: {
                    connect: {
                      uuid: storage.poolId
                    }
                  }
                }
              }
            }))
          },
          securityGroups: {
            create: props.securityGroupIds.map((sgId) => ({
              securityGroup: {
                connect: {
                  uuid: sgId
                }
              }
            }))
          }
        },
        ...virtualMachineArgs
      });
      return {
        success: true,
        data: toVirtualMachineRecord(created)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  update: async (id, props) => {
    try {
      const prisma = getPrismaClient();
      const updated = await prisma.virtualMachine.update({
        where: { uuid: id },
        data: {
          name: props.name,
          cpu: props.cpu,
          memoryMb: props.memoryBytes ? bytesToMb(props.memoryBytes) : void 0,
          status: props.status
        },
        ...virtualMachineArgs
      });
      return {
        success: true,
        data: toVirtualMachineRecord(updated)
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `Virtual machine with id ${id} not found`
            }
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  deleteById: async (id) => {
    try {
      const prisma = getPrismaClient();
      await prisma.virtualMachine.delete({
        where: { uuid: id }
      });
      return {
        success: true,
        data: void 0
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `Virtual machine with id ${id} not found`
            }
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  listNetworkInterfaces: async (virtualMachineId) => {
    try {
      const prisma = getPrismaClient();
      const interfaces = await prisma.networkInterface.findMany({
        where: {
          virtualMachine: {
            uuid: virtualMachineId
          }
        },
        ...networkInterfaceArgs
      });
      return {
        success: true,
        data: interfaces.map(toNetworkInterfaceRecord)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  getNetworkInterface: async (virtualMachineId, networkInterfaceId) => {
    try {
      const prisma = getPrismaClient();
      const networkInterface = await prisma.networkInterface.findFirst({
        where: {
          uuid: networkInterfaceId,
          virtualMachine: {
            uuid: virtualMachineId
          }
        },
        ...networkInterfaceArgs
      });
      if (!networkInterface) {
        return {
          success: true,
          data: null
        };
      }
      return {
        success: true,
        data: toNetworkInterfaceRecord(networkInterface)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  createNetworkInterface: async (vmId, props) => {
    try {
      const prisma = getPrismaClient();
      const created = await prisma.networkInterface.create({
        data: {
          name: props.name,
          ipAddress: props.ipAddress,
          macAddress: props.macAddress,
          virtualMachine: {
            connect: {
              uuid: vmId
            }
          },
          subnet: {
            connect: {
              uuid: props.subnetId
            }
          }
        },
        ...networkInterfaceArgs
      });
      return {
        success: true,
        data: toNetworkInterfaceRecord(created)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  updateNetworkInterface: async (virtualMachineId, networkInterfaceId, props) => {
    try {
      const prisma = getPrismaClient();
      const nic = await prisma.networkInterface.findFirst({
        where: {
          uuid: networkInterfaceId,
          virtualMachine: {
            uuid: virtualMachineId
          }
        }
      });
      if (!nic) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Network interface not found"
          }
        };
      }
      let subnetId = void 0;
      if (props.subnetId) {
        const subnet = await prisma.subnet.findUnique({
          where: { uuid: props.subnetId },
          select: { id: true }
        });
        if (!subnet) {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Subnet not found"
            }
          };
        }
        subnetId = subnet.id;
      }
      const updated = await prisma.networkInterface.update({
        where: { uuid: networkInterfaceId },
        data: {
          name: props.name,
          ipAddress: props.ipAddress,
          macAddress: props.macAddress,
          subnetId
        },
        ...networkInterfaceArgs
      });
      return {
        success: true,
        data: toNetworkInterfaceRecord(updated)
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Network interface not found"
            }
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  deleteNetworkInterface: async (virtualMachineId, networkInterfaceId) => {
    try {
      const prisma = getPrismaClient();
      const nic = await prisma.networkInterface.findFirst({
        where: {
          uuid: networkInterfaceId,
          virtualMachine: {
            uuid: virtualMachineId
          }
        }
      });
      if (!nic) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Network interface not found"
          }
        };
      }
      await prisma.networkInterface.delete({
        where: { uuid: networkInterfaceId }
      });
      return {
        success: true,
        data: void 0
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Network interface not found"
            }
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  listStorages: async (virtualMachineId) => {
    try {
      const prisma = getPrismaClient();
      const storages = await prisma.virtualMachineAttachedStorage.findMany({
        where: {
          virtualMachine: {
            uuid: virtualMachineId
          }
        },
        ...attachedStoragesArgs
      });
      return {
        success: true,
        data: storages.map(toStorageRecord)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  getStorage: async (virtualMachineId, storageId) => {
    try {
      const prisma = getPrismaClient();
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: virtualMachineId },
        select: {
          id: true
        }
      });
      const storagePromise = prisma.virtualStorage.findUnique({
        where: { uuid: storageId },
        select: {
          id: true
        }
      });
      const [vm, storage] = await Promise.all([vmPromise, storagePromise]);
      if (!vm || !storage) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or storage not found"
          }
        };
      }
      const attachedStorage = await prisma.virtualMachineAttachedStorage.findUnique({
        where: {
          virtualMachineId_virtualStorageId: {
            virtualMachineId: vm.id,
            virtualStorageId: storage.id
          }
        },
        ...attachedStoragesArgs
      });
      if (!attachedStorage) {
        return {
          success: true,
          data: null
        };
      }
      return {
        success: true,
        data: toStorageRecord(attachedStorage)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  createStorage: async (vmId, props) => {
    try {
      const prisma = getPrismaClient();
      const created = await prisma.virtualMachineAttachedStorage.create({
        data: {
          path: props.devicePath,
          virtualMachine: {
            connect: {
              uuid: vmId
            }
          },
          virtualStorage: {
            create: {
              name: props.name,
              sizeMb: bytesToMb(props.sizeBytes),
              storagePool: {
                connect: {
                  uuid: props.poolId
                }
              }
            }
          }
        },
        ...attachedStoragesArgs
      });
      return {
        success: true,
        data: toStorageRecord(created)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  updateStorage: async (virtualMachineId, storageId, props) => {
    try {
      const prisma = getPrismaClient();
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: virtualMachineId },
        select: {
          id: true
        }
      });
      const storagePromise = prisma.virtualStorage.findUnique({
        where: { uuid: storageId },
        select: {
          id: true
        }
      });
      const [vm, storage] = await Promise.all([vmPromise, storagePromise]);
      if (!vm || !storage) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or storage not found"
          }
        };
      }
      const updated = await prisma.virtualMachineAttachedStorage.update({
        where: {
          virtualMachineId_virtualStorageId: {
            virtualMachineId: vm.id,
            virtualStorageId: storage.id
          }
        },
        data: {
          virtualStorage: {
            update: {
              name: props.name
            }
          }
        },
        ...attachedStoragesArgs
      });
      return {
        success: true,
        data: toStorageRecord(updated)
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Virtual machine or storage not found"
            }
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  deleteStorage: async (virtualMachineId, storageId) => {
    try {
      const prisma = getPrismaClient();
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: virtualMachineId },
        select: {
          id: true
        }
      });
      const storagePromise = prisma.virtualStorage.findUnique({
        where: { uuid: storageId },
        select: {
          id: true
        }
      });
      const [vm, storage] = await Promise.all([vmPromise, storagePromise]);
      if (!vm || !storage) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or storage not found"
          }
        };
      }
      await prisma.virtualMachineAttachedStorage.delete({
        where: {
          virtualMachineId_virtualStorageId: {
            virtualMachineId: vm.id,
            virtualStorageId: storage.id
          }
        }
      });
      await prisma.virtualStorage.delete({
        where: { id: storage.id }
      });
      return {
        success: true,
        data: void 0
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Virtual storage not found"
            }
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  listSecurityGroups: async (virtualMachineId) => {
    try {
      const prisma = getPrismaClient();
      const sg = await prisma.virtualMachineSecurityGroup.findMany({
        where: {
          virtualMachine: {
            uuid: virtualMachineId
          }
        },
        select: {
          securityGroup: {
            select: {
              uuid: true
            }
          }
        }
      });
      return {
        success: true,
        data: sg.map((s) => s.securityGroup.uuid)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  addSecurityGroup: async (vmId, sgId) => {
    try {
      const prisma = getPrismaClient();
      await prisma.virtualMachineSecurityGroup.create({
        data: {
          virtualMachine: {
            connect: {
              uuid: vmId
            }
          },
          securityGroup: {
            connect: {
              uuid: sgId
            }
          }
        }
      });
      return {
        success: true,
        data: void 0
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: true,
            data: void 0
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  },
  removeSecurityGroup: async (vmId, sgId) => {
    try {
      const prisma = getPrismaClient();
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: vmId },
        select: { id: true }
      });
      const sgPromise = prisma.securityGroup.findUnique({
        where: { uuid: sgId },
        select: { id: true }
      });
      const [vm, sg] = await Promise.all([vmPromise, sgPromise]);
      if (!vm || !sg) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or security group not found"
          }
        };
      }
      await prisma.virtualMachineSecurityGroup.delete({
        where: {
          virtualMachineId_securityGroupId: {
            virtualMachineId: vm.id,
            securityGroupId: sg.id
          }
        }
      });
      return {
        success: true,
        data: void 0
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Virtual machine or security group not found"
            }
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: error.message
        }
      };
    }
  }
};

export { VirtualMachineRepository as V };
//# sourceMappingURL=VirtualMachineRepository.mjs.map
