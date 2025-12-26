import type { ResourceService } from "@@/server/common/service";
import type {
  ImageResponse,
  ImageCreateRequest,
  ImagePutRequest,
  ImagePatchRequest,
} from "@@/shared/types";
import { UserPermissions } from "@@/server/types";
import type { ServiceError } from "@@/server/common/errors";
import ImageRepository from "@@/server/repository/ImageRepository";
import type { Result } from "@@/server/common/type";

export const getImageService = (permission: UserPermissions) => {
  const ImageService: ResourceService<
    ImageResponse,
    ImageCreateRequest,
    ImagePatchRequest | ImagePutRequest,
    ServiceError
  > = {
    permission,
    list(query?: string): Result<ImageResponse[], ServiceError> {
      const images = ImageRepository.list();
      return { success: true, data: images };
    },
    getById(id): Result<ImageResponse, ServiceError> {
      const image = ImageRepository.getById(id);
      if (!image) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: image };
    },
    create(data) {
      const newImage = ImageRepository.create(data);
      if (!newImage) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newImage };
    },
    update(id, data) {
      const updatedImage = ImageRepository.update(id, data);
      if (!updatedImage) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedImage };
    },
    delete(id) {
      const deleted = ImageRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: null };
    },
  };
  return ImageService;
};
