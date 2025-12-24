import * as z from "zod";

// インスタンスタイプ名
export const InstanceTypeNameSchema = z
  .string()
  .min(1, "インスタンスタイプ名は必須です。");

// CPUコア数
export const CpuCoreSchema = z
  .number({
    message: "数値を入力してください。",
  })
  .int("整数で入力してください。")
  .min(1, "1以上の値を入力してください。");

// メモリサイズ (MB)
export const MemorySizeSchema = z
  .number({
    message: "数値を入力してください。",
  })
  .int("整数で入力してください。")
  .min(1, "1MB以上の値を入力してください。");

// インスタンスタイプ作成用スキーマ
export const InstanceTypeCreateSchema = z.object({
  name: InstanceTypeNameSchema,
  cpuCore: CpuCoreSchema,
  memorySize: MemorySizeSchema,
});

export type InstanceTypeCreateInput = z.infer<typeof InstanceTypeCreateSchema>;

// インスタンスタイプ更新用スキーマ
export const InstanceTypeUpdateSchema = z.object({
  name: InstanceTypeNameSchema,
  cpuCore: CpuCoreSchema,
  memorySize: MemorySizeSchema,
});

export type InstanceTypeUpdateInput = z.infer<typeof InstanceTypeUpdateSchema>;
