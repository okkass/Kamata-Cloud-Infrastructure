import { a as getPrismaClient, P as PrismaClientKnownRequestError } from '../nitro/nitro.mjs';

const parseCidr4 = (cidr) => {
  const parts = cidr.split("/");
  if (parts.length !== 2) {
    throw new Error(`Invalid CIDR notation: ${cidr}`);
  }
  const address = parts[0];
  const prefixLength = Number(parts[1]);
  if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error(`Invalid prefix length: ${parts[1]}`);
  }
  const addressArr = address.split(".").map((octet) => Number(octet));
  if (addressArr.length !== 4 || addressArr.some(
    (octet) => isNaN(octet) || octet < 0 || octet > 255 || !Number.isInteger(octet)
  )) {
    throw new Error(`Invalid IPv4 address: ${address}`);
  }
  const addressInt = (addressArr[0] << 24 | addressArr[1] << 16 | addressArr[2] << 8 | addressArr[3]) >>> 0;
  const netmaskInt = prefixLength === 0 ? 0 : -1 << 32 - prefixLength >>> 0;
  const brdcastInt = (addressInt | ~netmaskInt) >>> 0;
  const networkInt = (addressInt & netmaskInt) >>> 0;
  const network = [
    networkInt >>> 24 & 255,
    networkInt >>> 16 & 255,
    networkInt >>> 8 & 255,
    networkInt & 255
  ].join(".");
  return {
    address,
    addressInt,
    netmaskInt,
    brdcastInt,
    networkInt,
    network,
    prefixLength
  };
};
const hasOverlappingCidrs = (cidr1, cidr2) => {
  return !(cidr1.brdcastInt < cidr2.networkInt || cidr2.brdcastInt < cidr1.networkInt);
};
const isCidrInCidr = (cidrChild, cidrParent) => {
  return cidrParent.networkInt <= cidrChild.networkInt && cidrChild.brdcastInt <= cidrParent.brdcastInt;
};

const subnetArgs = {
  select: {
    uuid: true,
    name: true,
    cidr: true,
    createdAt: true,
    virtualNetwork: {
      select: {
        uuid: true,
        name: true,
        cidr: true,
        createdAt: true
      }
    }
  }
};
const virtualNetworkArgs = {
  select: {
    uuid: true,
    name: true,
    cidr: true,
    createdAt: true,
    subnets: subnetArgs,
    user: {
      select: {
        uuid: true,
        name: true
      }
    }
  }
};
const toRecordSubnet = (row) => {
  return {
    id: row.uuid,
    name: row.name,
    cidr: parseCidr4(row.cidr),
    createdAt: row.createdAt,
    owner: {
      id: row.virtualNetwork.uuid,
      name: row.virtualNetwork.name,
      cidr: parseCidr4(row.virtualNetwork.cidr),
      createdAt: row.virtualNetwork.createdAt
    }
  };
};
const toRecordVirtualNetwork = (row) => {
  return {
    id: row.uuid,
    name: row.name,
    cidr: parseCidr4(row.cidr),
    createdAt: row.createdAt,
    subnets: row.subnets.map(toRecordSubnet),
    owner: {
      id: row.user.uuid,
      name: row.user.name
    }
  };
};
const list = async (userUuid) => {
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
    const vnets = await prisma.virtualNetwork.findMany({
      ...virtualNetworkArgs,
      where: whereClause
    });
    return {
      success: true,
      data: vnets.map(toRecordVirtualNetwork)
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
};
const getById = async (id) => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      ...virtualNetworkArgs,
      where: { uuid: id }
    });
    return {
      success: true,
      data: vnet ? toRecordVirtualNetwork(vnet) : null
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
};
const create = async (data) => {
  try {
    const prisma = getPrismaClient();
    const newNetwork = await prisma.virtualNetwork.create({
      data: {
        name: data.name,
        cidr: data.cidr,
        user: {
          connect: { uuid: data.userId }
        },
        subnets: {
          create: data.initialSubnets.map((subnet) => ({
            name: subnet.name,
            cidr: subnet.cidr
          }))
        }
      },
      ...virtualNetworkArgs
    });
    return {
      success: true,
      data: toRecordVirtualNetwork(newNetwork)
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
};
const update = async (id, updateFields) => {
  try {
    const prisma = getPrismaClient();
    const updated = await prisma.virtualNetwork.update({
      where: { uuid: id },
      data: {
        name: updateFields.name
      },
      ...virtualNetworkArgs
    });
    return {
      success: true,
      data: toRecordVirtualNetwork(updated)
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "VirtualNetwork not found"
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
};
const deleteById = async (id) => {
  try {
    const prisma = getPrismaClient();
    await prisma.virtualNetwork.delete({
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
            message: "Virtual network not found"
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
};
const listSubnets = async (vnetId) => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true }
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found"
        }
      };
    }
    const subnets = await prisma.subnet.findMany({
      ...subnetArgs,
      where: { virtualNetworkId: vnet.id }
    });
    return {
      success: true,
      data: subnets.map(toRecordSubnet)
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
};
const getSubnet = async (vnetId, subnetId) => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true }
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found"
        }
      };
    }
    const subnet = await prisma.subnet.findUnique({
      where: {
        virtualNetworkId: vnet.id,
        uuid: subnetId
      },
      ...subnetArgs
    });
    return {
      success: true,
      data: subnet ? toRecordSubnet(subnet) : null
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
};
const createSubnet = async (vnetId, props) => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true }
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found"
        }
      };
    }
    const newSubnet = await prisma.subnet.create({
      data: {
        name: props.name,
        cidr: props.cidr,
        virtualNetwork: {
          connect: { id: vnet.id }
        }
      },
      ...subnetArgs
    });
    return {
      success: true,
      data: toRecordSubnet(newSubnet)
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
};
const updateSubnet = async (vnetId, subnetId, props) => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true }
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found"
        }
      };
    }
    const target = await prisma.subnet.findUnique({
      where: {
        virtualNetworkId: vnet.id,
        uuid: subnetId
      },
      select: { id: true }
    });
    if (!target) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Subnet not found"
        }
      };
    }
    const updated = await prisma.subnet.update({
      where: { id: target.id },
      data: {
        name: props.name,
        cidr: props.cidr
      },
      ...subnetArgs
    });
    return {
      success: true,
      data: toRecordSubnet(updated)
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Subnet not found"
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
};
const deleteSubnet = async (vnetId, subnetId) => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true }
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found"
        }
      };
    }
    const target = await prisma.subnet.findUnique({
      where: {
        virtualNetworkId: vnet.id,
        uuid: subnetId
      },
      select: { id: true }
    });
    if (!target) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Subnet not found"
        }
      };
    }
    await prisma.subnet.delete({
      where: { id: target.id }
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
            message: "Subnet not found"
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
};
const VirtualNetworkRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  listSubnets,
  getSubnet,
  createSubnet,
  updateSubnet,
  deleteSubnet
};

const toSubnetResponse = (record, parent) => {
  return {
    id: record.id,
    name: record.name,
    cidr: record.cidr.address + "/" + record.cidr.prefixLength,
    createdAt: record.createdAt.toISOString(),
    parent: parent ? {
      id: parent.id,
      name: parent.name,
      cidr: parent.cidr.address + "/" + parent.cidr.prefixLength,
      createdAt: parent.createdAt.toISOString()
    } : void 0
  };
};
const toNetworkResponse = (record) => {
  return {
    id: record.id,
    name: record.name,
    cidr: record.cidr.address + "/" + record.cidr.prefixLength,
    createdAt: record.createdAt.toISOString(),
    owner: record.owner,
    subnets: record.subnets.map((subnet) => toSubnetResponse(subnet, record))
  };
};
const toSubnetInsertProps = (data) => {
  const ip = parseCidr4(data.cidr);
  return {
    name: data.name,
    cidr: ip.network + "/" + ip.prefixLength
  };
};
const toNetworkInsertProps = (userId, data) => {
  const ip = parseCidr4(data.cidr);
  return {
    name: data.name,
    cidr: ip.network + "/" + ip.prefixLength,
    userId,
    initialSubnets: data.initialSubnets.map(toSubnetInsertProps)
  };
};
const getVirtualNetworkService = (permission) => {
  const VirtualNetworkService = {
    list: async (query) => {
      const result = await VirtualNetworkRepository.list(query);
      if (!result.success) {
        return {
          success: false,
          error: {
            reason: "InternalError"
          }
        };
      }
      return {
        success: true,
        data: result.data.map(toNetworkResponse)
      };
    },
    getById: async (id) => {
      const result = await VirtualNetworkRepository.getById(id);
      if (!result.success) {
        return {
          success: false,
          error: {
            reason: result.error.reason === "NotFound" ? "NotFound" : "InternalError",
            message: result.error.message
          }
        };
      }
      if (!result.data) {
        return {
          success: false,
          error: {
            reason: "NotFound"
          }
        };
      }
      return {
        success: true,
        data: toNetworkResponse(result.data)
      };
    },
    create: async (data) => {
      var _a, _b;
      const parentInet = parseCidr4(data.cidr);
      const subnetInets = [];
      for (const subnet of data.initialSubnets || []) {
        const subnetInet = parseCidr4(subnet.cidr);
        if (isCidrInCidr(subnetInet, parentInet)) {
          subnetInets.push(subnetInet);
        } else {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `Subnet CIDR ${subnet.cidr} is not within parent CIDR`
            }
          };
        }
      }
      for (let i = 0; i < subnetInets.length; i++) {
        for (let j = i + 1; j < subnetInets.length; j++) {
          if (hasOverlappingCidrs(subnetInets[i], subnetInets[j])) {
            return {
              success: false,
              error: {
                reason: "BadRequest",
                message: `Overlapping CIDRs found among subnets: ${(_a = data.initialSubnets) == null ? void 0 : _a[i].cidr} and ${(_b = data.initialSubnets) == null ? void 0 : _b[j].cidr}`
              }
            };
          }
        }
      }
      const newVnet = await VirtualNetworkRepository.create(
        toNetworkInsertProps(permission.id, data)
      );
      if (!newVnet.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: newVnet.error.message
          }
        };
      }
      return { success: true, data: toNetworkResponse(newVnet.data) };
    },
    update: async (id, data) => {
      const result = await VirtualNetworkRepository.update(
        id,
        data
      );
      if (!result.success) {
        return {
          success: false,
          error: {
            reason: result.error.reason === "NotFound" ? "NotFound" : "InternalError",
            message: result.error.message
          }
        };
      }
      return { success: true, data: toNetworkResponse(result.data) };
    },
    delete: async (id) => {
      const result = await VirtualNetworkRepository.deleteById(id);
      if (!result.success) {
        return {
          success: false,
          error: {
            reason: result.error.reason === "NotFound" ? "NotFound" : "InternalError",
            message: result.error.message
          }
        };
      }
      return { success: true, data: void 0 };
    },
    getSubnetService(vnetId) {
      const SubnetService = {
        list: async (query) => {
          const result = await VirtualNetworkRepository.listSubnets(vnetId);
          if (!result.success) {
            return {
              success: false,
              error: {
                reason: result.error.reason === "NotFound" ? "NotFound" : "InternalError",
                message: result.error.message
              }
            };
          }
          const parent = await VirtualNetworkRepository.getById(vnetId);
          if (!parent.success || !parent.data) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to retrieve parent virtual network"
              }
            };
          }
          return {
            success: true,
            data: result.data.map(
              (subnet) => toSubnetResponse(subnet, parent.data)
            )
          };
        },
        getById: async (id) => {
          const result = await VirtualNetworkRepository.getSubnet(vnetId, id);
          if (!result.success) {
            return {
              success: false,
              error: {
                reason: result.error.reason === "NotFound" ? "NotFound" : "InternalError",
                message: result.error.message
              }
            };
          }
          if (!result.data) {
            return {
              success: false,
              error: {
                reason: "NotFound"
              }
            };
          }
          const parent = await VirtualNetworkRepository.getById(vnetId);
          if (!parent.success || !parent.data) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to retrieve parent virtual network"
              }
            };
          }
          return {
            success: true,
            data: toSubnetResponse(result.data, parent.data)
          };
        },
        create: async (data) => {
          const subnetInet = parseCidr4(data.cidr);
          const parentResult = await VirtualNetworkRepository.getById(vnetId);
          if (!parentResult.success || !parentResult.data) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to retrieve parent virtual network"
              }
            };
          }
          if (!isCidrInCidr(subnetInet, parentResult.data.cidr)) {
            return {
              success: false,
              error: {
                reason: "BadRequest",
                message: "Subnet CIDR is not within parent CIDR"
              }
            };
          }
          const subnets = parentResult.data.subnets.map((s) => s.cidr);
          subnets.push(subnetInet);
          for (let i = 0; i < subnets.length; i++) {
            for (let j = i + 1; j < subnets.length; j++) {
              if (hasOverlappingCidrs(subnets[i], subnets[j])) {
                return {
                  success: false,
                  error: {
                    reason: "BadRequest",
                    message: "Overlapping CIDRs found among subnets"
                  }
                };
              }
            }
          }
          const newSubnet = await VirtualNetworkRepository.createSubnet(
            vnetId,
            toSubnetInsertProps(data)
          );
          if (!newSubnet.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to create subnet"
              }
            };
          }
          return {
            success: true,
            data: toSubnetResponse(newSubnet.data, parentResult.data)
          };
        },
        update: async (id, data) => {
          const parentResult = await VirtualNetworkRepository.getById(vnetId);
          if (!parentResult.success || !parentResult.data) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to retrieve parent virtual network"
              }
            };
          }
          const parent = parentResult.data;
          if (data.cidr) {
            const subnetInet = parseCidr4(data.cidr);
            if (!isCidrInCidr(subnetInet, parent.cidr)) {
              return {
                success: false,
                error: {
                  reason: "BadRequest",
                  message: "Subnet CIDR is not within parent CIDR"
                }
              };
            }
            const subnets = parent.subnets.filter((s) => s.id !== id).map((s) => s.cidr);
            subnets.push(subnetInet);
            for (let i = 0; i < subnets.length; i++) {
              for (let j = i + 1; j < subnets.length; j++) {
                if (hasOverlappingCidrs(subnets[i], subnets[j])) {
                  return {
                    success: false,
                    error: {
                      reason: "BadRequest",
                      message: "Overlapping CIDRs found among subnets"
                    }
                  };
                }
              }
            }
          }
          let cidr = void 0;
          if (data.cidr) {
            const parsed = parseCidr4(data.cidr);
            cidr = parsed.network + "/" + parsed.prefixLength;
          }
          const result = await VirtualNetworkRepository.updateSubnet(
            vnetId,
            id,
            {
              name: data.name,
              cidr
            }
          );
          if (!result.success) {
            return {
              success: false,
              error: {
                reason: result.error.reason === "NotFound" ? "NotFound" : "InternalError",
                message: result.error.message
              }
            };
          }
          if (!result.data) {
            return {
              success: false,
              error: {
                reason: "NotFound"
              }
            };
          }
          return {
            success: true,
            data: toSubnetResponse(result.data, parent)
          };
        },
        delete: async (id) => {
          const result = await VirtualNetworkRepository.deleteSubnet(
            vnetId,
            id
          );
          if (!result.success) {
            return {
              success: false,
              error: {
                reason: result.error.reason === "NotFound" ? "NotFound" : "InternalError",
                message: result.error.message
              }
            };
          }
          return { success: true, data: void 0 };
        }
      };
      return SubnetService;
    }
  };
  return VirtualNetworkService;
};

export { getVirtualNetworkService as g };
//# sourceMappingURL=VirtualNetworkService.mjs.map
