import type {
  ImageResponse,
  ImageCreateRequest,
  ImagePatchRequest,
  ImagePutRequest,
} from "@@/shared/types";

import { NodeRepository } from "./NodeRepository";

import crypto from "crypto";

let images: Array<ImageResponse> | null = null;

const initImages = (): Array<ImageResponse> => {
  return [
    {
      id: "9456327e-7f15-48a5-875e-e367ec02ebaf",
      name: "Ubuntu 20.04",
      createdAt: new Date().toISOString(),
      size: 2 * 1024 * 1024 * 1024, // 2 GB
      node: NodeRepository.getById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
    },
    {
      id: "616294c5-65fc-4336-8655-f61726ca55cd",
      name: "CentOS 8",
      createdAt: new Date().toISOString(),
      size: 3 * 1024 * 1024 * 1024, // 3 GB
      node: NodeRepository.getById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
    },
    {
      id: "42af756f-6710-4994-b993-f2b2c2c5393b",
      name: "Debian 10",
      createdAt: new Date().toISOString(),
      size: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
      node: NodeRepository.getById("a2dcd604-49cb-4e1c-826a-2071d50404a3")!,
    },
  ];
};

const list = (): Array<ImageResponse> => {
  if (!images) {
    images = initImages();
  }
  return images;
};

const getById = (id: string): ImageResponse | undefined => {
  return list().find((image) => image.id === id);
};

const create = (image: ImageCreateRequest): ImageResponse | undefined => {
  const node = NodeRepository.getById(image.nodeId);
  if (!node) {
    return undefined;
  }

  const newImage: ImageResponse = {
    id: crypto.randomUUID(),
    name: image.name,
    createdAt: new Date().toISOString(),
    size: 2 * 1024 * 1024 * 1024, // 2 GB
    node: node,
  };
  list().push(newImage);
  return newImage;
};

const update = (
  id: string,
  updateFields: ImagePatchRequest | ImagePutRequest
): ImageResponse | undefined => {
  let target = getById(id);
  if (target === undefined) {
    return undefined;
  }
  target.name = updateFields.name ?? target.name;
  return target;
};

const deleteById = (id: string): boolean => {
  const initialLength = list().length;
  images = list().filter((image) => image.id !== id);
  return list().length < initialLength;
};

export const ImageRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default ImageRepository;
