import { g as getInstanceTypeService } from './InstanceTypeService.mjs';
import { V as VirtualMachineRepository } from './VirtualMachineRepository.mjs';
import { g as getNodeService } from './NodeService.mjs';
import { g as getSecurityGroupService } from './SecurityGroupService.mjs';
import { g as getStoragePoolService } from './StoragePoolService.mjs';
import { g as getVirtualNetworkService } from './VirtualNetworkService.mjs';

const toStorageResponse = (record, pool) => {
  return {
    id: record.id,
    name: record.name,
    size: record.sizeBytes,
    pool,
    createdAt: record.createdAt.toISOString(),
    devicePath: record.devicePath
  };
};
const toNetworkResponse = (record, subnet) => {
  return {
    id: record.id,
    name: record.name,
    macAddress: record.macAddress,
    ipAddress: record.ipAddress,
    subnet
  };
};
const toVirtualMachineResponse = (record, node, securityGroups, storages, networkInterfaces) => {
  return {
    id: record.id,
    name: record.name,
    status: "running",
    // 仮の値。実際にはハイパーバイザーから取得する必要がある
    node,
    createdAt: record.createdAt.toISOString(),
    owner: {
      id: record.owner.id,
      name: record.owner.name
    },
    securityGroups,
    storages,
    networkInterfaces,
    cpuUtilization: 0,
    // 仮の値。実際にはハイパーバイザーから取得する必要がある
    memoryUtilization: 0,
    // 仮の値。実際にはハイパーバイザーから取得する必要がある
    storageUtilization: 0,
    // 仮の値。実際にはハイパーバイザーから取得する必要がある
    cpuCore: record.cpuCore,
    memorySize: record.memoryBytes
  };
};
const getVirtualMachineService = (permission) => {
  const virtualMachineService = {
    list: async (query) => {
      const res = await VirtualMachineRepository.list();
      if (!res.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message
          }
        };
      }
      const vms = res.data;
      const nodeMap = {};
      const securityGroupMap = {};
      const poolMap = {};
      const subnetMap = {};
      const nodeIds = /* @__PURE__ */ new Set();
      const securityGroupIds = /* @__PURE__ */ new Set();
      const storagePoolIds = /* @__PURE__ */ new Set();
      const vnetIds = /* @__PURE__ */ new Set();
      for (const vm of vms) {
        nodeIds.add(vm.nodeId);
        vm.securityGroupIds.forEach((id) => securityGroupIds.add(id));
        vm.storages.forEach((storage) => storagePoolIds.add(storage.poolId));
        vm.networkInterfaces.forEach((nic) => vnetIds.add(nic.vnetId));
      }
      const nodeService = getNodeService();
      const securityGroupService = getSecurityGroupService(permission);
      const storagePoolService = getStoragePoolService();
      const virtualNetworkService = getVirtualNetworkService(permission);
      const nodePromises = Array.from(nodeIds).map(
        (nodeId) => nodeService.getById(nodeId).then((res2) => {
          if (res2.success && res2.data) {
            nodeMap[nodeId] = res2.data;
          }
        })
      );
      const securityGroupPromises = Array.from(securityGroupIds).map(
        (groupId) => securityGroupService.getById(groupId).then((res2) => {
          if (res2.success && res2.data) {
            securityGroupMap[groupId] = res2.data;
          }
        })
      );
      const storagePoolPromises = Array.from(storagePoolIds).map(
        (poolId) => storagePoolService.getById(poolId).then((res2) => {
          if (res2.success && res2.data) {
            poolMap[poolId] = res2.data;
          }
        })
      );
      const subnetPromises = Array.from(vnetIds).map(
        (vnetId) => virtualNetworkService.getById(vnetId).then((res2) => {
          if (res2.success && res2.data) {
            res2.data.subnets.forEach((subnet) => {
              subnetMap[subnet.id] = subnet;
            });
          }
        })
      );
      await Promise.all([
        ...nodePromises,
        ...securityGroupPromises,
        ...storagePoolPromises,
        ...subnetPromises
      ]);
      const vmResponses = vms.map((vm) => {
        const node = nodeMap[vm.nodeId];
        const securityGroups = vm.securityGroupIds.map((id) => securityGroupMap[id]).filter(Boolean);
        const storages = vm.storages.map((storage) => {
          const pool = poolMap[storage.poolId];
          return toStorageResponse(storage, pool);
        });
        const networkInterfaces = vm.networkInterfaces.map((nic) => {
          const subnet = subnetMap[nic.subnetId];
          return toNetworkResponse(nic, subnet);
        });
        return toVirtualMachineResponse(
          vm,
          node,
          securityGroups,
          storages,
          networkInterfaces
        );
      });
      return { success: true, data: vmResponses };
    },
    getById: async (id) => {
      const res = await VirtualMachineRepository.getById(id);
      if (!res.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message
          }
        };
      }
      if (!res.data) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: `VirtualMachine with id ${id} not found`
          }
        };
      }
      const vm = res.data;
      const subnetMap = {};
      const storagePoolMap = {};
      const storagePoolIds = /* @__PURE__ */ new Set();
      const vnetIds = /* @__PURE__ */ new Set();
      vm.storages.forEach((storage) => storagePoolIds.add(storage.poolId));
      vm.networkInterfaces.forEach((nic) => vnetIds.add(nic.vnetId));
      const nodeService = getNodeService();
      const securityGroupService = getSecurityGroupService(permission);
      const storagePoolService = getStoragePoolService();
      const virtualNetworkService = getVirtualNetworkService(permission);
      const nodePromise = nodeService.getById(vm.nodeId);
      const securityGroupPromises = vm.securityGroupIds.map(
        (sgId) => securityGroupService.getById(sgId)
      );
      const storagePoolPromises = vm.storages.map(
        (storage) => storagePoolService.getById(storage.poolId)
      );
      const subnetPromises = vm.networkInterfaces.map(
        (nic) => virtualNetworkService.getById(nic.vnetId).then((res2) => {
          if (res2.success && res2.data) {
            res2.data.subnets.forEach((subnet) => {
              subnetMap[subnet.id] = subnet;
            });
          }
          return res2;
        })
      );
      const results = await Promise.all([
        nodePromise,
        ...securityGroupPromises,
        ...storagePoolPromises,
        ...subnetPromises
      ]);
      for (const res2 of results) {
        if (!res2.success) {
          return {
            success: false,
            error: {
              reason: "InternalError"
            }
          };
        }
      }
      const node = results[0].data;
      const securityGroups = results.slice(1, 1 + vm.securityGroupIds.length).map((res2) => res2.data);
      const storagePools = results.slice(
        1 + vm.securityGroupIds.length,
        1 + vm.securityGroupIds.length + vm.storages.length
      ).map((res2) => res2.data);
      storagePools.forEach((pool) => storagePoolMap[pool.id] = pool);
      const storages = vm.storages.map((storage) => {
        const pool = storagePoolMap[storage.poolId];
        return toStorageResponse(storage, pool);
      });
      const networkInterfaces = vm.networkInterfaces.map((nic) => {
        const subnet = subnetMap[nic.vnetId];
        return toNetworkResponse(nic, subnet);
      });
      const vmResponse = toVirtualMachineResponse(
        vm,
        node,
        securityGroups,
        storages,
        networkInterfaces
      );
      return { success: true, data: vmResponse };
    },
    create: async (data) => {
      let spec;
      if ("instanceTypeId" in data.spec) {
        const instanceTypeService = getInstanceTypeService();
        const res2 = await instanceTypeService.getById(data.spec.instanceTypeId);
        if (!res2.success) {
          return {
            success: false,
            error: {
              reason: "InternalError",
              message: res2.error.message
            }
          };
        }
        if (!res2.data) {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `InstanceType with id ${data.spec.instanceTypeId} not found`
            }
          };
        }
        spec = {
          cpuCore: res2.data.cpuCore,
          memoryBytes: res2.data.memorySize
        };
      }
      if ("cpu" in data.spec && "memory" in data.spec) {
        spec = {
          cpuCore: data.spec.cpu,
          memoryBytes: data.spec.memory
        };
      }
      if (!spec) {
        return {
          success: false,
          error: {
            reason: "BadRequest",
            message: "Invalid spec format"
          }
        };
      }
      const insertData = {
        userId: permission.id,
        nodeId: data.nodeId,
        imageId: data.imageId,
        nics: data.subnetIds.map((subnetId) => {
          return {
            name: `nic-${subnetId}`,
            macAddress: "",
            // 仮の値。実際にはハイパーバイザーがMACアドレスを生成する必要がある
            ipAddress: "",
            // 仮の値。実際にはDHCPなどでIPアドレスが割り当てられるため、ここでは空文字を入れておく
            subnetId
          };
        }),
        storages: data.storages.map((storage) => {
          return {
            name: storage.name,
            sizeBytes: storage.size,
            poolId: storage.poolId,
            devicePath: ""
            // 仮の値。実際にはハイパーバイザーがデバイスパスを生成する必要がある
          };
        }),
        securityGroupIds: data.securityGroupIds,
        name: data.name,
        cpu: spec.cpuCore,
        memoryBytes: spec.memoryBytes
      };
      const res = await VirtualMachineRepository.create(insertData);
      if (!res.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message
          }
        };
      }
      const vm = res.data;
      const created = await virtualMachineService.getById(vm.id);
      if (!created.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: created.error.message
          }
        };
      }
      if (!created.data) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: `VirtualMachine with id ${vm.id} not found after creation`
          }
        };
      }
      return {
        success: true,
        data: created.data
      };
    },
    update: async (id, data) => {
      let spec;
      if (data.spec && "instanceTypeId" in data.spec) {
        const instanceTypeService = getInstanceTypeService();
        const res2 = await instanceTypeService.getById(data.spec.instanceTypeId);
        if (!res2.success) {
          return {
            success: false,
            error: {
              reason: "InternalError",
              message: res2.error.message
            }
          };
        }
        if (!res2.data) {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `InstanceType with id ${data.spec.instanceTypeId} not found`
            }
          };
        }
        spec = {
          cpuCore: res2.data.cpuCore,
          memoryBytes: res2.data.memorySize
        };
      }
      const updateData = {
        name: data.name,
        cpu: spec == null ? void 0 : spec.cpuCore,
        memoryBytes: spec == null ? void 0 : spec.memoryBytes
      };
      const res = await VirtualMachineRepository.update(id, updateData);
      if (!res.success) {
        if (res.error.reason === "NotFound") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `VirtualMachine with id ${id} not found`
            }
          };
        }
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message
          }
        };
      }
      const updatedVm = await virtualMachineService.getById(id);
      if (!updatedVm.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: updatedVm.error.message
          }
        };
      }
      return {
        success: true,
        data: updatedVm.data
      };
    },
    delete: async (id) => {
      const res = await VirtualMachineRepository.deleteById(id);
      if (!res.success) {
        if (res.error.reason === "NotFound") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `VirtualMachine with id ${id} not found`
            }
          };
        }
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message
          }
        };
      }
      return {
        success: true,
        data: void 0
      };
    },
    getStorageService(vmId) {
      const StorageService = {
        list: async (query) => {
          const res = await VirtualMachineRepository.listStorages(vmId);
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          const storages = res.data;
          const poolIds = /* @__PURE__ */ new Set();
          storages.forEach((storage) => poolIds.add(storage.poolId));
          const storagePoolService = getStoragePoolService();
          const storagePoolPromises = Array.from(poolIds).map(
            (poolId) => storagePoolService.getById(poolId)
          );
          const results = await Promise.all(storagePoolPromises);
          for (const res2 of results) {
            if (!res2.success) {
              return {
                success: false,
                error: {
                  reason: "InternalError",
                  message: res2.error.message
                }
              };
            }
          }
          const poolMap = {};
          results.forEach((res2) => {
            const pool = res2.data;
            poolMap[pool.id] = pool;
          });
          const storageResponses = storages.map((storage) => {
            const pool = poolMap[storage.poolId];
            return toStorageResponse(storage, pool);
          });
          return { success: true, data: storageResponses };
        },
        getById: async (id) => {
          const res = await VirtualMachineRepository.getStorage(vmId, id);
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          if (!res.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `Storage with id ${id} not found for VirtualMachine with id ${vmId}`
              }
            };
          }
          const storage = res.data;
          const storagePoolService = getStoragePoolService();
          const poolRes = await storagePoolService.getById(storage.poolId);
          if (!poolRes.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: poolRes.error.message
              }
            };
          }
          if (!poolRes.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `StoragePool with id ${storage.poolId} not found for Storage with id ${id}`
              }
            };
          }
          const pool = poolRes.data;
          const storageResponse = toStorageResponse(storage, pool);
          return { success: true, data: storageResponse };
        },
        create: async (data) => {
          const res = await VirtualMachineRepository.createStorage(vmId, {
            name: data.name,
            sizeBytes: data.size,
            poolId: data.poolId,
            devicePath: ""
            // 仮の値。実際にはハイパーバイザーがデバイスパスを生成する必要がある
          });
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          const createdStorage = await StorageService.getById(res.data.id);
          if (!createdStorage.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: createdStorage.error.message
              }
            };
          }
          if (!createdStorage.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `Storage with id ${res.data.id} not found for VirtualMachine with id ${vmId} after creation`
              }
            };
          }
          return {
            success: true,
            data: createdStorage.data
          };
        },
        update: async (id, data) => {
          const repoRes = await VirtualMachineRepository.updateStorage(
            vmId,
            id,
            {
              name: data.name
            }
          );
          if (!repoRes.success) {
            if (repoRes.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `Storage with id ${id} not found for VirtualMachine with id ${vmId}`
                }
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: repoRes.error.message
              }
            };
          }
          const updatedStorage = await StorageService.getById(repoRes.data.id);
          if (!updatedStorage.success) {
            return updatedStorage;
          }
          return { success: true, data: updatedStorage.data };
        },
        delete: async (id) => {
          const res = await VirtualMachineRepository.deleteStorage(vmId, id);
          if (!res.success) {
            if (res.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `Storage with id ${id} not found for VirtualMachine with id ${vmId}`
                }
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          return {
            success: true,
            data: void 0
          };
        }
      };
      return StorageService;
    },
    getNetworkInterfaceService(vmId) {
      const NetworkInterfaceService = {
        list: async (query) => {
          const res = await VirtualMachineRepository.listNetworkInterfaces(vmId);
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          const nics = res.data;
          const vnetIds = /* @__PURE__ */ new Set();
          nics.forEach((nic) => vnetIds.add(nic.vnetId));
          const virtualNetworkService = getVirtualNetworkService(permission);
          const virtualNetworkPromises = Array.from(vnetIds).map(
            (vnetId) => virtualNetworkService.getById(vnetId)
          );
          const results = await Promise.all(virtualNetworkPromises);
          for (const res2 of results) {
            if (!res2.success) {
              return {
                success: false,
                error: {
                  reason: "InternalError",
                  message: res2.error.message
                }
              };
            }
          }
          const subnetMap = {};
          results.forEach((res2) => {
            const vnet = res2.data;
            vnet.subnets.forEach((subnet) => {
              subnetMap[subnet.id] = subnet;
            });
          });
          const nicResponses = nics.map((nic) => {
            const subnet = subnetMap[nic.vnetId];
            return toNetworkResponse(nic, subnet);
          });
          return { success: true, data: nicResponses };
        },
        getById: async (id) => {
          const res = await VirtualMachineRepository.getNetworkInterface(
            vmId,
            id
          );
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          if (!res.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `NetworkInterface with id ${id} not found`
              }
            };
          }
          const nic = res.data;
          const virtualNetworkService = getVirtualNetworkService(permission);
          const vnetRes = await virtualNetworkService.getById(nic.vnetId);
          if (!vnetRes.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: vnetRes.error.message
              }
            };
          }
          if (!vnetRes.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `VirtualNetwork with id ${nic.vnetId} not found for NetworkInterface with id ${id}`
              }
            };
          }
          const vnet = vnetRes.data;
          const subnet = vnet.subnets.find((s) => s.id === nic.subnetId);
          if (!subnet) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `Subnet with id ${nic.subnetId} not found in VirtualNetwork with id ${nic.vnetId} for NetworkInterface with id ${id}`
              }
            };
          }
          const nicResponse = toNetworkResponse(nic, subnet);
          return { success: true, data: nicResponse };
        },
        create: async (data) => {
          const res = await VirtualMachineRepository.createNetworkInterface(
            vmId,
            {
              name: data.name || `nic-${data.subnetId}`,
              macAddress: "",
              ipAddress: "",
              subnetId: data.subnetId
            }
          );
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          const createdNic = await NetworkInterfaceService.getById(res.data.id);
          if (!createdNic.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: createdNic.error.message
              }
            };
          }
          if (!createdNic.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `NetworkInterface with id ${res.data.id} not found for VirtualMachine with id ${vmId} after creation`
              }
            };
          }
          return {
            success: true,
            data: createdNic.data
          };
        },
        update: async (id, data) => {
          const repoRes = await VirtualMachineRepository.updateNetworkInterface(
            vmId,
            id,
            {
              name: data.name
            }
          );
          if (!repoRes.success) {
            if (repoRes.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `NetworkInterface with id ${id} not found for VirtualMachine with id ${vmId}`
                }
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: repoRes.error.message
              }
            };
          }
          const updatedNic = await NetworkInterfaceService.getById(
            repoRes.data.id
          );
          if (!updatedNic.success) {
            return updatedNic;
          }
          return { success: true, data: updatedNic.data };
        },
        delete: async (id) => {
          const res = await VirtualMachineRepository.deleteNetworkInterface(
            vmId,
            id
          );
          if (!res.success) {
            if (res.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `NetworkInterface with id ${id} not found for VirtualMachine with id ${vmId}`
                }
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          return { success: true, data: void 0 };
        }
      };
      return NetworkInterfaceService;
    },
    getVmSecurityGroupService(vmId) {
      const VmSecurityGroupService = {
        list: async (query) => {
          const res = await VirtualMachineRepository.listSecurityGroups(vmId);
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          const sgService = getSecurityGroupService(permission);
          const sgPromises = res.data.map((sgId) => sgService.getById(sgId));
          const sgResults = await Promise.all(sgPromises);
          for (const res2 of sgResults) {
            if (!res2.success) {
              return {
                success: false,
                error: {
                  reason: "InternalError",
                  message: res2.error.message
                }
              };
            }
          }
          const securityGroups = sgResults.map((res2) => res2.data);
          return { success: true, data: securityGroups };
        },
        getById: async (id) => {
          return await new Promise(
            (resolve) => {
              resolve({
                success: false,
                error: {
                  reason: "BadRequest",
                  message: "Use SecurityGroupService to get security group details"
                }
              });
            }
          );
        },
        create: async (data) => {
          const res = await VirtualMachineRepository.addSecurityGroup(
            vmId,
            data.securityGroupId
          );
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          const sgService = getSecurityGroupService(permission);
          const addedSg = await sgService.getById(data.securityGroupId);
          if (!addedSg.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: addedSg.error.message
              }
            };
          }
          return { success: true, data: addedSg.data };
        },
        update: async (id, data) => {
          return await new Promise((resolve) => {
            resolve({
              success: false,
              error: {
                reason: "BadRequest",
                message: "Update operation is not supported for security groups of a virtual machine"
              }
            });
          });
        },
        delete: async (id) => {
          const res = await VirtualMachineRepository.removeSecurityGroup(
            vmId,
            id
          );
          if (!res.success) {
            if (res.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `SecurityGroup with id ${id} not found for VirtualMachine with id ${vmId}`
                }
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message
              }
            };
          }
          return { success: true, data: void 0 };
        }
      };
      return VmSecurityGroupService;
    },
    getPowerService(vmId) {
      const powerService = {
        start: async () => {
          return { success: true, data: "Accepted" };
        },
        shutdown: async () => {
          return { success: true, data: "Accepted" };
        },
        stop: async () => {
          return { success: true, data: "Accepted" };
        },
        reboot: async () => {
          return { success: true, data: "Accepted" };
        },
        reset: async () => {
          return { success: true, data: "Accepted" };
        }
      };
      return powerService;
    }
  };
  return virtualMachineService;
};

export { getVirtualMachineService as g };
//# sourceMappingURL=VirtualMachineService.mjs.map
