import type { ResourceService } from "@/common/service";
import type {
  ImageResponse,
  ImageCreateRequest,
  ImagePutRequest,
  ImagePatchRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import ImageRepository from "@/repository/ImageRepository";

// PrismaのKnownRequestErrorっぽい形（import不要）
type PrismaKnownRequestErrorLike = {
  code: string;
  message?: string;
  meta?: unknown;
};

const isPrismaKnownRequestError = (e: unknown): e is PrismaKnownRequestErrorLike =>
  typeof e === "object" &&
  e !== null &&
  "code" in e &&
  typeof (e as any).code === "string";

// 権限（必要なら厳密化）
const canManageImages = (permission: UserPermissions | null) => {
  if (!permission) return false;
  return permission.isAdmin === true || permission.isImageAdmin === true;
};

export const getImageService = (permission: UserPermissions | null = null) => {
  const imageService: ResourceService<
    ImageResponse,
    ImageCreateRequest,
    ImagePatchRequest | ImagePutRequest,
    ServiceError
  > = {
    permission,

    list: async (_query?: string) => {
      try {
        const images = await ImageRepository.list();
        return { success: true, data: images };
      } catch (_error: unknown) {
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to list images" },
        };
      }
    },

    getById: async (id: string) => {
      try {
        const image = await ImageRepository.getById(id);
        if (!image) return { success: false, error: { reason: "NotFound" } };
        return { success: true, data: image };
      } catch (_error: unknown) {
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to get image" },
        };
      }
    },

    create: async (data: ImageCreateRequest) => {
      if (!canManageImages(permission)) {
        return { success: false, error: { reason: "Forbidden" } };
      }

      try {
        const created = await ImageRepository.create(data);
        return { success: true, data: created };
      } catch (error: unknown) {
        if (isPrismaKnownRequestError(error)) {
          if (error.code === "P2002") {
            return {
              success: false,
              error: { reason: "BadRequest", message: "Image already exists" },
            };
          }
          if (error.code === "P2003") {
            return {
              success: false,
              error: { reason: "BadRequest", message: "Invalid nodeId" },
            };
          }
        }
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to create image" },
        };
      }
    },

    update: async (id: string, data: ImagePatchRequest | ImagePutRequest) => {
      if (!canManageImages(permission)) {
        return { success: false, error: { reason: "Forbidden" } };
      }

      try {
        const updated = await ImageRepository.update(id, data);
        if (!updated) return { success: false, error: { reason: "NotFound" } };
        return { success: true, data: updated };
      } catch (error: unknown) {
        if (isPrismaKnownRequestError(error) && error.code === "P2002") {
          return {
            success: false,
            error: { reason: "BadRequest", message: "Image already exists" },
          };
        }
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to update image" },
        };
      }
    },

    delete: async (id: string) => {
      if (!canManageImages(permission)) {
        return { success: false, error: { reason: "Forbidden" } };
      }

      try {
        const deleted = await ImageRepository.deleteById(id);
        if (!deleted) return { success: false, error: { reason: "NotFound" } };
        return { success: true, data: null };
      } catch (error: unknown) {
        // 参照制約などをここで Conflict/BadRequest に寄せたい場合は code を見て分岐できる
        if (isPrismaKnownRequestError(error)) {
          return {
            success: false,
            error: { reason: "BadRequest", message: "Failed to delete image" },
          };
        }
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to delete image" },
        };
      }
    },
  };

  return imageService;
};
