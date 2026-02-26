import * as z from 'zod';

const InstanceTypeNameSchema = z.string().min(1, "インスタンスタイプ名は必須です。");
const CpuCoreSchema = z.number({
  message: "数値を入力してください。"
}).int("整数で入力してください。").min(1, "1以上の値を入力してください。");
const MemorySizeSchema = z.number({
  message: "数値を入力してください。"
}).int("整数で入力してください。").min(1, "1MB以上の値を入力してください。");
const InstanceTypeCreateSchema = z.object({
  name: InstanceTypeNameSchema,
  cpuCore: CpuCoreSchema,
  memorySize: MemorySizeSchema
});
const InstanceTypeUpdateSchema = z.object({
  name: InstanceTypeNameSchema,
  cpuCore: CpuCoreSchema,
  memorySize: MemorySizeSchema
});

export { InstanceTypeCreateSchema as I, InstanceTypeUpdateSchema as a };
//# sourceMappingURL=instance-type-BB8zzCzi.mjs.map
