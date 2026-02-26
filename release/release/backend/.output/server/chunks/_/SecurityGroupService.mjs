import { a as getPrismaClient, P as PrismaClientKnownRequestError, U as UserRepository } from '../nitro/nitro.mjs';

const PORT_ALL = 65536;
const securityRuleArgs = {
  select: {
    uuid: true,
    name: true,
    roleType: true,
    port: true,
    protocol: true,
    targetIp: true,
    action: true,
    createdAt: true
  }
};
const securityGroupArgs = {
  select: {
    uuid: true,
    name: true,
    description: true,
    createdAt: true,
    rules: securityRuleArgs,
    user: {
      select: {
        uuid: true,
        name: true
      }
    }
  }
};
const toResponseRule = (row) => {
  return {
    uuid: row.uuid,
    name: row.name,
    ruleType: row.roleType,
    port: row.port === PORT_ALL ? null : row.port,
    protocol: row.protocol,
    targetIp: row.targetIp,
    action: row.action,
    createdAt: row.createdAt
  };
};
const toResponseGroup = (row) => {
  var _a;
  return {
    uuid: row.uuid,
    name: row.name,
    description: (_a = row.description) != null ? _a : void 0,
    createdAt: row.createdAt,
    owner: {
      uuid: row.user.uuid,
      name: row.user.name
    },
    rules: row.rules.map(toResponseRule)
  };
};
const list = async (userUuid) => {
  try {
    const prisma = getPrismaClient();
    const whereClause = userUuid ? { user: { uuid: userUuid } } : {};
    const groups = await prisma.securityGroup.findMany({
      where: whereClause,
      ...securityGroupArgs,
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: groups.map(toResponseGroup) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const getById = async (id) => {
  try {
    const prisma = getPrismaClient();
    const group = await prisma.securityGroup.findUnique({
      where: { uuid: id },
      ...securityGroupArgs
    });
    return {
      success: true,
      data: group ? toResponseGroup(group) : null
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const create = async (data) => {
  try {
    const prisma = getPrismaClient();
    const newGroup = await prisma.securityGroup.create({
      data: {
        name: data.name,
        description: data.description,
        user: {
          connect: { uuid: data.userId }
        },
        rules: {
          create: data.rules.map((rule) => ({
            name: rule.name,
            roleType: rule.ruleType,
            port: rule.port === null ? PORT_ALL : rule.port,
            protocol: rule.protocol,
            targetIp: rule.targetIp,
            action: rule.action
          }))
        }
      },
      ...securityGroupArgs
    });
    return { success: true, data: toResponseGroup(newGroup) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const update = async (id, updateFields) => {
  try {
    const prisma = getPrismaClient();
    const data = await prisma.securityGroup.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
        description: updateFields.description
      },
      ...securityGroupArgs
    });
    return { success: true, data: toResponseGroup(data) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified security group was not found."
          }
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const deleteById = async (id) => {
  try {
    const prisma = getPrismaClient();
    await prisma.securityGroup.delete({ where: { uuid: id } });
    return { success: true, data: void 0 };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified security group was not found."
          }
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const listRules = async (securityGroupId) => {
  try {
    const prisma = getPrismaClient();
    const data = await prisma.securityRule.findMany({
      where: { securityGroup: { uuid: securityGroupId } },
      ...securityRuleArgs
    });
    return { success: true, data: data.map(toResponseRule) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const getRuleById = async (sgId, ruleId) => {
  try {
    const prisma = getPrismaClient();
    const sg = await prisma.securityGroup.findUnique({
      where: { uuid: sgId },
      select: { id: true }
    });
    if (!sg) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "The specified security group was not found."
        }
      };
    }
    const data = await prisma.securityRule.findUnique({
      where: {
        uuid: ruleId,
        securityGroupId: sg.id
      },
      ...securityRuleArgs
    });
    return { success: true, data: data ? toResponseRule(data) : null };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const createRule = async (sgId, ruleData) => {
  try {
    const prisma = getPrismaClient();
    const data = await prisma.securityRule.create({
      data: {
        name: ruleData.name,
        roleType: ruleData.ruleType,
        port: ruleData.port === null ? PORT_ALL : ruleData.port,
        protocol: ruleData.protocol,
        targetIp: ruleData.targetIp,
        action: ruleData.action,
        securityGroup: {
          connect: { uuid: sgId }
        }
      },
      ...securityRuleArgs
    });
    return { success: true, data: toResponseRule(data) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const updateRule = async (sgId, ruleId, updateFields) => {
  try {
    const prisma = getPrismaClient();
    const sg = await prisma.securityGroup.findUnique({
      where: { uuid: sgId },
      select: { id: true }
    });
    if (!sg) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "The specified security group was not found."
        }
      };
    }
    const data = await prisma.securityRule.update({
      where: {
        uuid: ruleId,
        securityGroupId: sg.id
      },
      data: {
        name: updateFields.name,
        roleType: updateFields.ruleType,
        port: updateFields.port === null ? PORT_ALL : updateFields.port,
        protocol: updateFields.protocol,
        targetIp: updateFields.targetIp,
        action: updateFields.action
      }
    });
    return { success: true, data: toResponseRule(data) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const deleteRule = async (sgId, ruleId) => {
  try {
    const prisma = getPrismaClient();
    const sg = await prisma.securityGroup.findUnique({
      where: { uuid: sgId },
      select: { id: true }
    });
    if (!sg) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "The specified security group was not found."
        }
      };
    }
    await prisma.securityRule.delete({
      where: {
        uuid: ruleId,
        securityGroupId: sg.id
      }
    });
    return { success: true, data: void 0 };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const SecurityGroupRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  listRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule
};

const checkPermission = async (permissions, initialCheck, dbcheck) => {
  if (!initialCheck) {
    return false;
  }
  const user = await UserRepository.getById(permissions.id);
  if (!user) {
    return false;
  }
  return dbcheck(user);
};
const getPermissionService = () => {
  return {
    hasImageAdminPermission: async (permissions) => {
      return await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isImageAdmin,
        (user) => {
          var _a, _b, _c, _d;
          return ((_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false) || ((_d = (_c = user.permission) == null ? void 0 : _c.isImageAdmin) != null ? _d : false);
        }
      );
    },
    hasInstanceTypeAdminPermission: async (permissions) => {
      return await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isInstanceTypeAdmin,
        (user) => {
          var _a, _b, _c, _d;
          return ((_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false) || ((_d = (_c = user.permission) == null ? void 0 : _c.isInstanceTypeAdmin) != null ? _d : false);
        }
      );
    },
    hasNodeAdminPermission: async (permissions) => {
      return await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isNodeAdmin,
        (user) => {
          var _a, _b, _c, _d;
          return ((_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false) || ((_d = (_c = user.permission) == null ? void 0 : _c.isNodeAdmin) != null ? _d : false);
        }
      );
    },
    hasVirtualMachineAdminPermission: async (permissions, resourceId) => {
      const checkAdmin = await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isVirtualMachineAdmin,
        (user) => {
          var _a, _b, _c, _d;
          return ((_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false) || ((_d = (_c = user.permission) == null ? void 0 : _c.isVirtualMachineAdmin) != null ? _d : false);
        }
      );
      const checkOwner = false;
      return checkAdmin || checkOwner;
    },
    hasNetworkAdminPermission: async (permissions, resourceId) => {
      const checkAdmin = await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isNetworkAdmin,
        (user) => {
          var _a, _b, _c, _d;
          return ((_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false) || ((_d = (_c = user.permission) == null ? void 0 : _c.isNetworkAdmin) != null ? _d : false);
        }
      );
      const checkOwner = false;
      return checkAdmin || checkOwner;
    },
    hasSecurityGroupAdminPermission: async (permissions, resourceId) => {
      const checkAdmin = await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isSecurityGroupAdmin,
        (user) => {
          var _a, _b, _c, _d;
          return ((_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false) || ((_d = (_c = user.permission) == null ? void 0 : _c.isSecurityGroupAdmin) != null ? _d : false);
        }
      );
      const sg = await SecurityGroupRepository.getById(resourceId != null ? resourceId : "");
      let checkOwner = false;
      if (sg && sg.success && sg.data) {
        checkOwner = sg.data.owner.uuid === permissions.id;
      }
      return checkAdmin || checkOwner;
    },
    hasStoragePoolAdminPermission: async (permissions) => {
      const check = await checkPermission(
        permissions,
        permissions.isAdmin,
        (user) => {
          var _a, _b;
          return (_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false;
        }
      );
      return check;
    },
    hasUserAdminPermission: async (permissions) => {
      const check = await checkPermission(
        permissions,
        permissions.isAdmin,
        (user) => {
          var _a, _b;
          return (_b = (_a = user.permission) == null ? void 0 : _a.isAdmin) != null ? _b : false;
        }
      );
      return check;
    }
  };
};

const mapRuleRecordToResponse = (record) => {
  return {
    id: record.uuid,
    name: record.name,
    ruleType: record.ruleType,
    port: record.port,
    protocol: record.protocol,
    targetIp: record.targetIp,
    action: record.action,
    createdAt: record.createdAt.toISOString()
  };
};
const mapGroupRecordToResponse = (record) => {
  var _a;
  return {
    id: record.uuid,
    name: record.name,
    description: (_a = record.description) != null ? _a : void 0,
    owner: {
      id: record.owner.uuid,
      name: record.owner.name
    },
    rules: record.rules.map(mapRuleRecordToResponse),
    createdAt: record.createdAt.toISOString()
  };
};
const mapRuleCreateRequestToInput = (request) => {
  return {
    name: request.name,
    ruleType: request.ruleType,
    port: request.port,
    protocol: request.protocol,
    targetIp: request.targetIp,
    action: request.action
  };
};
const mapGroupCreateRequestToInput = (userId, request) => {
  var _a;
  return {
    userId,
    name: request.name,
    description: (_a = request.description) != null ? _a : void 0,
    rules: request.rules.map(mapRuleCreateRequestToInput)
  };
};
const mapRuleUpdateRequestToInput = (request) => {
  return {
    name: request.name,
    ruleType: request.ruleType,
    port: request.port,
    protocol: request.protocol,
    targetIp: request.targetIp,
    action: request.action
  };
};
const mapGroupUpdateRequestToInput = (request) => {
  var _a;
  return {
    name: request.name,
    description: (_a = request.description) != null ? _a : void 0
  };
};
const getSecurityGroupService = (permission) => {
  const SecurityGroupService = {
    list: async (query) => {
      let userId = void 0;
      if (query === "all") {
        const permissionService = getPermissionService();
        const hasPermission = await permissionService.hasSecurityGroupAdminPermission(permission);
        if (!hasPermission) {
          return { success: false, error: { reason: "Forbidden" } };
        }
      } else {
        userId = permission.id;
      }
      const result = await SecurityGroupRepository.list(userId);
      if (!result.success) {
        return { success: false, error: { reason: "InternalError" } };
      }
      const groups = result.data.map(mapGroupRecordToResponse);
      return { success: true, data: groups };
    },
    getById: async (id) => {
      const result = await SecurityGroupRepository.getById(id);
      if (!result.success) {
        return { success: false, error: { reason: "InternalError" } };
      }
      if (!result.data) {
        return { success: false, error: { reason: "NotFound" } };
      }
      return {
        success: true,
        data: mapGroupRecordToResponse(result.data)
      };
    },
    create: async (data) => {
      const result = await SecurityGroupRepository.create(
        mapGroupCreateRequestToInput(permission.id, data)
      );
      if (!result.success) {
        return { success: false, error: { reason: "InternalError" } };
      }
      return {
        success: true,
        data: mapGroupRecordToResponse(result.data)
      };
    },
    update: async (id, data) => {
      const permissionService = getPermissionService();
      const hasPermission = await permissionService.hasSecurityGroupAdminPermission(permission, id);
      if (!hasPermission) {
        return { success: false, error: { reason: "Forbidden" } };
      }
      const result = await SecurityGroupRepository.update(
        id,
        mapGroupUpdateRequestToInput(data)
      );
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return { success: false, error: { reason: "InternalError" } };
      }
      return {
        success: true,
        data: mapGroupRecordToResponse(result.data)
      };
    },
    delete: async (id) => {
      const permissionService = getPermissionService();
      const hasPermission = await permissionService.hasSecurityGroupAdminPermission(permission, id);
      if (!hasPermission) {
        return { success: false, error: { reason: "Forbidden" } };
      }
      const result = await SecurityGroupRepository.deleteById(id);
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return { success: false, error: { reason: "InternalError" } };
      }
      return { success: true, data: void 0 };
    },
    getSecurityRuleService: async (sgId) => {
      const permissionService = getPermissionService();
      const hasPermission = await permissionService.hasSecurityGroupAdminPermission(
        permission,
        sgId
      );
      if (!hasPermission) {
        return {
          list: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          getById: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          create: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          update: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          delete: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          }
        };
      }
      const SecurityRuleService = {
        list: async (query) => {
          const result = await SecurityGroupRepository.listRules(sgId);
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          const rules = result.data.map(mapRuleRecordToResponse);
          return { success: true, data: rules };
        },
        getById: async (id) => {
          const result = await SecurityGroupRepository.getRuleById(sgId, id);
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          if (!result.data) {
            return { success: false, error: { reason: "NotFound" } };
          }
          return {
            success: true,
            data: mapRuleRecordToResponse(result.data)
          };
        },
        create: async (data) => {
          const result = await SecurityGroupRepository.createRule(
            sgId,
            mapRuleCreateRequestToInput(data)
          );
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          return {
            success: true,
            data: mapRuleRecordToResponse(result.data)
          };
        },
        update: async (id, data) => {
          const result = await SecurityGroupRepository.updateRule(
            sgId,
            id,
            mapRuleUpdateRequestToInput(data)
          );
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          return {
            success: true,
            data: mapRuleRecordToResponse(result.data)
          };
        },
        delete: async (id) => {
          const result = await SecurityGroupRepository.deleteRule(sgId, id);
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          return { success: true, data: void 0 };
        }
      };
      return SecurityRuleService;
    }
  };
  return SecurityGroupService;
};

export { getSecurityGroupService as g };
//# sourceMappingURL=SecurityGroupService.mjs.map
