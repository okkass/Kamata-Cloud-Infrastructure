import { deleteStoragePool } from "@/services/storagePoolService";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const success = deleteStoragePool(id);

  if (success) {
    return {
      message: `Storage pool with ID ${id} has been deleted.`,
    };
  } else {
    throw createError({
      statusCode: 404,
      statusMessage: `Storage pool with ID ${id} not found.`,
    });
  }
});
