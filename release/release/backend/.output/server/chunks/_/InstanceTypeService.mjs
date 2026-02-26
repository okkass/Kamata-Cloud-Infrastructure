import { b as bytesToMb, m as mbToBytes } from './mathUtils.mjs';
import { a as getPrismaClient, P as PrismaClientKnownRequestError } from '../nitro/nitro.mjs';

const instanceTypeArgs = {
  select: {
    uuid: true,
    name: true,
    cpuCore: true,
    memorySizeMb: true,
    createdAt: true
  }
};
const instanceTypeManyArgs = {
  ...instanceTypeArgs,
  orderBy: {
    createdAt: "desc"
  }
};
const toResponse$1 = (row) => {
  return {
    uuid: row.uuid,
    name: row.name,
    cpuCore: row.cpuCore,
    // DBはMB -> 窓口はbytesに変換
    memorySizeBytes: mbToBytes(row.memorySizeMb),
    createdAt: row.createdAt.toISOString()
  };
};
const list = async () => {
  try {
    const prisma = getPrismaClient();
    const rows = await prisma.instanceType.findMany(instanceTypeManyArgs);
    const records = rows.map((row) => toResponse$1(row));
    return { success: true, data: records };
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
    const row = await prisma.instanceType.findUnique({
      where: { uuid: id },
      ...instanceTypeArgs
    });
    const res = row ? toResponse$1(row) : null;
    return { success: true, data: res };
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
const create = async (instanceType) => {
  try {
    const prisma = getPrismaClient();
    const newRow = await prisma.instanceType.create({
      data: {
        name: instanceType.name,
        cpuCore: instanceType.cpuCore,
        // DBへはMBで保存
        memorySizeMb: bytesToMb(instanceType.memorySizeBytes)
      },
      ...instanceTypeArgs
    });
    return { success: true, data: toResponse$1(newRow) };
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
    const updatedRow = await prisma.instanceType.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
        cpuCore: updateFields.cpuCore,
        // DBへはMBで保存
        memorySizeMb: updateFields.memorySizeBytes ? bytesToMb(updateFields.memorySizeBytes) : void 0
      },
      ...instanceTypeArgs
    });
    return { success: true, data: toResponse$1(updatedRow) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified instance type was not found."
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
    await prisma.instanceType.delete({ where: { uuid: id } });
    return { success: true, data: void 0 };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified instance type was not found."
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
const InstanceTypeRepository = {
  list,
  getById,
  create,
  update,
  deleteById
};

const toResponse = (record) => {
  return {
    id: record.uuid,
    name: record.name,
    cpuCore: record.cpuCore,
    memorySize: record.memorySizeBytes,
    createdAt: record.createdAt
  };
};
const toInsertProps = (data) => {
  return {
    name: data.name,
    cpuCore: data.cpuCore,
    memorySizeBytes: data.memorySize
  };
};
const toUpdateProps = (data) => {
  return {
    name: data.name,
    cpuCore: data.cpuCore,
    memorySizeBytes: data.memorySize
  };
};
const getInstanceTypeService = (permission) => {
  const InstanceTypeService = {
    list: async (query) => {
      const instanceTypes = await InstanceTypeRepository.list();
      if (!instanceTypes.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return { success: true, data: instanceTypes.data.map(toResponse) };
    },
    getById: async (id) => {
      const instanceType = await InstanceTypeRepository.getById(id);
      if (!instanceType.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      if (!instanceType.data) {
        return {
          success: false,
          error: { reason: "NotFound" }
        };
      }
      return { success: true, data: toResponse(instanceType.data) };
    },
    create: async (data) => {
      const newInstanceType = await InstanceTypeRepository.create(
        toInsertProps(data)
      );
      if (!newInstanceType.success) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return { success: true, data: toResponse(newInstanceType.data) };
    },
    update: async (id, data) => {
      const updatedInstanceType = await InstanceTypeRepository.update(
        id,
        toUpdateProps(data)
      );
      if (!updatedInstanceType.success) {
        if (updatedInstanceType.error.reason === "NotFound") {
          return {
            success: false,
            error: { reason: "NotFound" }
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return { success: true, data: toResponse(updatedInstanceType.data) };
    },
    delete: async (id) => {
      const deleted = await InstanceTypeRepository.deleteById(id);
      if (!deleted.success) {
        if (deleted.error.reason === "NotFound") {
          return {
            success: false,
            error: { reason: "NotFound" }
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return { success: true, data: void 0 };
    }
  };
  return InstanceTypeService;
};

export { getInstanceTypeService as g };
//# sourceMappingURL=InstanceTypeService.mjs.map
