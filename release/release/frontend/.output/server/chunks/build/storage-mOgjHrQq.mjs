import * as z from 'zod';

const StorageAddSchema = z.object({
  name: z.string().min(1, "プール名は必須です。"),
  nodeId: z.string({ message: "物理ノードは必須です。" }).min(1, "物理ノードは必須です。"),
  devicePath: z.string({ message: "デバイスパスは必須です。" }).min(1, "デバイスパスは必須です。"),
  hasNetworkAccess: z.string()
});
const StorageEditSchema = z.object({
  name: z.string().min(1, "プール名は必須です。"),
  hasNetworkAccess: z.string()
});

export { StorageAddSchema as S, StorageEditSchema as a };
//# sourceMappingURL=storage-mOgjHrQq.mjs.map
