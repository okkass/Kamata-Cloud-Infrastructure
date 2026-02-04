import type { ResourceService } from "@/common/service";
import type {
  ImageResponse,
  ImageCreateRequest,
  ImagePutRequest,
  ImagePatchRequest,
  StoragePoolResponse,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import ImageRepository from "@/repository/ImageRepository";
import type { ImageRecord } from "@/repository/ImageRepository";
import { getStoragePoolService } from "./StoragePoolService";
import type { Result } from "@/common/type";

const mapRecordToResponse = (
  record: ImageRecord,
  pool: StoragePoolResponse,
): ImageResponse => {
  return {
    id: record.uuid,
    name: record.name,
    description: record.description,
    size: record.sizeBytes,
    createdAt: record.createdAt.toISOString(),
    storagePool: pool,
  };
};

export const getImageService = (permission: UserPermissions) => {
  const imageService: ResourceService<
    ImageResponse,
    ImageCreateRequest,
    ImagePatchRequest | ImagePutRequest,
    ServiceError
  > = {
    list: async (
      query: string,
    ): Promise<Result<ImageResponse[], ServiceError>> => {
      // ImageとStoragePoolを全件取得
      const imagePromise = ImageRepository.list();
      const poolService = getStoragePoolService(permission);
      const poolPromise = poolService.list();

      const [imageResult, poolResult] = await Promise.all([
        imagePromise,
        poolPromise,
      ]);

      // resultのエラーチェック
      if (!imageResult.success || !poolResult.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Failed to list images",
          },
        };
      }
      // StoragePoolをuuidでマップ化
      const poolMap = new Map<string, StoragePoolResponse>();
      for (const pool of poolResult.data) {
        poolMap.set(pool.id, pool);
      }

      // ImageRecord -> ImageResponse へ変換
      const responses: ImageResponse[] = [];
      for (const image of imageResult.data) {
        const pool = poolMap.get(image.ownPoolUuid);
        if (!pool) {
          return {
            success: false,
            error: {
              reason: "InternalError",
              message: `Storage pool not found for image ${image.uuid}`,
            },
          };
        }
        responses.push(mapRecordToResponse(image, pool));
      }

      return { success: true, data: responses };
    },
    getById: async (id): Promise<Result<ImageResponse, ServiceError>> => {
      const imageResult = await ImageRepository.getById(id);
      if (!imageResult.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Failed to get image",
          },
        };
      }
      if (!imageResult.data) {
        return { success: false, error: { reason: "NotFound" } };
      }

      const poolService = getStoragePoolService(permission);
      const poolResult = await poolService.getById(
        imageResult.data.ownPoolUuid,
      );
      if (!poolResult.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Failed to get storage pool",
          },
        };
      }
      if (!poolResult.data) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: "Storage pool not found",
          },
        };
      }

      const response = mapRecordToResponse(imageResult.data, poolResult.data);
      return { success: true, data: response };
    },
    create: async (data) => {
      const result = await ImageRepository.create({
        name: data.name,
        description: data.description,
        sizeBytes: 2 * 1024 * 1024 * 1024, // デフォルト2GB
        poolId: data.storagePoolId,
      });
      if (!result.success) {
        if (result.error.reason === "BadRequest") {
          return { success: false, error: { reason: "BadRequest" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }

      // 作成したImageのStoragePoolを取得
      const poolService = getStoragePoolService(permission);
      const poolResult = await poolService.getById(data.storagePoolId);
      if (!poolResult.success || !poolResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }

      return {
        success: true,
        data: mapRecordToResponse(result.data, poolResult.data),
      };
    },
    update: async (id, data) => {
      const result = await ImageRepository.update(id, {
        name: data.name,
        description: data.description,
      });
      if (!result.success) {
        if (result.error.reason === "BadRequest") {
          return { success: false, error: { reason: "BadRequest" } };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      const poolService = getStoragePoolService(permission);
      const poolResult = await poolService.getById(result.data.ownPoolUuid);
      if (!poolResult.success || !poolResult.data) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return {
        success: true,
        data: mapRecordToResponse(result.data, poolResult.data),
      };
    },
    delete: async (id) => {
      const result = await ImageRepository.deleteById(id);
      if (!result.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return { success: true, data: undefined };
    },
  };

  return imageService;
};
