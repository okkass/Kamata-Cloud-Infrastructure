import ImageRepository from "@/repository/ImageRepository";
import {
  NodeNotFoundError,
  ImageNotFoundError,
} from "@/repository/ImageRepository";
import type { FetchFunc, CreateFunc, UpdateFunc, DeleteFunc } from "@/types";
import type {
  ImageResponse,
  ImageCreateRequest,
  ImagePutRequest,
  ImagePatchRequest,
} from "@app/shared/types";
import { NotFoundError, BadRequestError } from "@/types";

const listImages: FetchFunc<ImageResponse[]> = () => {
  return {
    success: true,
    data: ImageRepository.list(),
  };
};

const getById: FetchFunc<ImageResponse> = (payload) => {
  const image = ImageRepository.getById(payload.id!);
  if (!image) {
    return {
      success: false,
      error: new NotFoundError(`Image with id ${payload.id} not found`),
    };
  }
  return {
    success: true,
    data: image,
  };
};

const create: CreateFunc<ImageCreateRequest, ImageResponse> = (payload) => {
  try {
    const newImage = ImageRepository.create(payload.body);
    return {
      success: true,
      data: newImage,
    };
  } catch (error) {
    if (error instanceof NodeNotFoundError) {
      return {
        success: false,
        error: new BadRequestError(error.message),
      };
    }
    return {
      success: false,
      error: error as Error,
    };
  }
};

const update: UpdateFunc<ImagePutRequest | ImagePatchRequest, ImageResponse> = (
  payload
) => {
  try {
    const res = ImageRepository.update(payload.id, payload.body);
    return {
      success: true,
      data: res,
    };
  } catch (error) {
    if (error instanceof ImageNotFoundError) {
      return {
        success: false,
        error: new BadRequestError(error.message),
      };
    } else if (error instanceof NodeNotFoundError) {
      return {
        success: false,
        error: new BadRequestError(error.message),
      };
    }
    return {
      success: false,
      error: error as Error,
    };
  }
};

const deleteById: DeleteFunc = (payload) => {
  const success = ImageRepository.deleteById(payload.id);
  if (!success) {
    return {
      success: false,
      error: new NotFoundError(`Image with id ${payload.id} not found`),
    };
  }
  return {
    success: true,
    data: null,
  };
};

export const ImageService = {
  listImages,
  getById,
  create,
  update,
  deleteById,
};
