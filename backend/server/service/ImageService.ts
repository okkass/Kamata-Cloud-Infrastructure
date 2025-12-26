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
import type { Result } from "@/common/type";

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
