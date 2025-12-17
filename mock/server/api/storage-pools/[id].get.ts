import { validate } from "uuid";
import { getStoragePoolById } from "@/services/storagePoolService";
import { StoragePoolResponse } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const pool = getStoragePoolById(id);
  if (!pool) {
    throw createError({
      statusCode: 404,
      statusMessage: "Storage pool not found",
    });
  }
  return pool;
});
