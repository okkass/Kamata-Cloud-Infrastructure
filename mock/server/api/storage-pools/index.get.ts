import { getStoragePools } from "@/services/storagePoolService";

export default defineEventHandler((event) => {
  return getStoragePools();
});
