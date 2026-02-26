import { b as bytesToMb, m as mbToBytes } from './mathUtils.mjs';
import { a as getPrismaClient, P as PrismaClientKnownRequestError } from '../nitro/nitro.mjs';
import { g as getStoragePoolService } from './StoragePoolService.mjs';

const imageArgs = {
  select: {
    uuid: true,
    name: true,
    description: true,
    sizeMb: true,
    createdAt: true,
    ownPool: {
      select: { uuid: true }
    }
  }
};
const mapDbImageToImageRecord = (image) => {
  var _a;
  return {
    uuid: image.uuid,
    name: image.name,
    description: (_a = image.description) != null ? _a : void 0,
    createdAt: image.createdAt,
    sizeBytes: mbToBytes(image.sizeMb),
    ownPoolUuid: image.ownPool.uuid
  };
};
const list = async () => {
  const prisma = getPrismaClient();
  try {
    const images = await prisma.image.findMany({
      ...imageArgs,
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: images.map(mapDbImageToImageRecord) };
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
  const prisma = getPrismaClient();
  try {
    const image = await prisma.image.findUnique({
      where: { uuid: id },
      ...imageArgs
    });
    return image ? { success: true, data: mapDbImageToImageRecord(image) } : { success: true, data: null };
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
const create = async (image) => {
  var _a;
  const prisma = getPrismaClient();
  try {
    const pool = await prisma.storagePool.findUnique({
      where: { uuid: image.poolId },
      select: { id: true }
    });
    if (!pool) {
      return {
        success: false,
        error: { reason: "BadRequest", message: "Pool not found" }
      };
    }
    const newImage = await prisma.image.create({
      data: {
        name: image.name,
        description: (_a = image.description) != null ? _a : null,
        sizeMb: bytesToMb(image.sizeBytes),
        ownPoolId: pool.id
      },
      ...imageArgs
    });
    return { success: true, data: mapDbImageToImageRecord(newImage) };
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
  const prisma = getPrismaClient();
  try {
    const updated = await prisma.image.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
        description: updateFields.description
      },
      ...imageArgs
    });
    return { success: true, data: mapDbImageToImageRecord(updated) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: { reason: "NotFound", message: "Image not found" }
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
  const prisma = getPrismaClient();
  try {
    await prisma.image.delete({ where: { uuid: id } });
    return { success: true, data: void 0 };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: { reason: "NotFound", message: "Image not found" }
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
const ImageRepository = {
  list,
  getById,
  create,
  update,
  deleteById
};

const mapRecordToResponse = (record, pool) => {
  return {
    id: record.uuid,
    name: record.name,
    description: record.description,
    size: record.sizeBytes,
    createdAt: record.createdAt.toISOString(),
    storagePool: pool
  };
};
const getImageService = (permission) => {
  const imageService = {
    list: async (query) => {
      const imagePromise = ImageRepository.list();
      const poolService = getStoragePoolService();
      const poolPromise = poolService.list();
      const [imageResult, poolResult] = await Promise.all([
        imagePromise,
        poolPromise
      ]);
      if (!imageResult.success || !poolResult.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Failed to list images"
          }
        };
      }
      const poolMap = /* @__PURE__ */ new Map();
      for (const pool of poolResult.data) {
        poolMap.set(pool.id, pool);
      }
      const responses = [];
      for (const image of imageResult.data) {
        const pool = poolMap.get(image.ownPoolUuid);
        if (!pool) {
          return {
            success: false,
            error: {
              reason: "InternalError",
              message: `Storage pool not found for image ${image.uuid}`
            }
          };
        }
        responses.push(mapRecordToResponse(image, pool));
      }
      return { success: true, data: responses };
    },
    getById: async (id) => {
      const imageResult = await ImageRepository.getById(id);
      if (!imageResult.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Failed to get image"
          }
        };
      }
      if (!imageResult.data) {
        return { success: false, error: { reason: "NotFound" } };
      }
      const poolService = getStoragePoolService();
      const poolResult = await poolService.getById(
        imageResult.data.ownPoolUuid
      );
      if (!poolResult.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Failed to get storage pool"
          }
        };
      }
      if (!poolResult.data) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Storage pool not found"
          }
        };
      }
      const response = mapRecordToResponse(imageResult.data, poolResult.data);
      return { success: true, data: response };
    },
    create: async (data) => {
      const result = await ImageRepository.create({
        name: data.name,
        description: data.description,
        sizeBytes: 2 * 1024 * 1024 * 1024,
        // デフォルト2GB
        poolId: data.storagePoolId
      });
      if (!result.success) {
        if (result.error.reason === "BadRequest") {
          return { success: false, error: { reason: "BadRequest" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const poolService = getStoragePoolService();
      const poolResult = await poolService.getById(data.storagePoolId);
      if (!poolResult.success || !poolResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return {
        success: true,
        data: mapRecordToResponse(result.data, poolResult.data)
      };
    },
    update: async (id, data) => {
      const result = await ImageRepository.update(id, {
        name: data.name,
        description: data.description
      });
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      const poolService = getStoragePoolService();
      const poolResult = await poolService.getById(result.data.ownPoolUuid);
      if (!poolResult.success || !poolResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return {
        success: true,
        data: mapRecordToResponse(result.data, poolResult.data)
      };
    },
    delete: async (id) => {
      const result = await ImageRepository.deleteById(id);
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" }
        };
      }
      return { success: true, data: void 0 };
    }
  };
  return imageService;
};

export { getImageService as g };
//# sourceMappingURL=ImageService.mjs.map
