<template>
  <div class="modal-space">
    <FormSelect
      label="テンプレート"
      name="template-select"
      :pending="templatesPending"
      :error="templatesError"
      :options="templates ?? []"
      placeholder="使用しない"
      :placeholder-value="undefined"
      v-model="templateId"
      v-model:attrs="templateIdAttrs"
    >
      <template #option="{ option }">
        {{ option.name }} ({{ option.cpuCores }}コア,
        {{ convertByteToUnit(option.memorySize, "MB") }}MB)
      </template>
    </FormSelect>
    <FormSection title="CPU / メモリ" v-if="!values.templateId">
      <FormInput
        label="CPUコア数"
        name="cpu-cores"
        type="number"
        v-model="cpuCores"
        v-model:attrs="cpuCoresAttrs"
        :error="errors.cpuCores"
      >
        <template #suffix>
          <span class="form-unit-label">vCPU</span>
        </template>
      </FormInput>

      <FormInput
        label="メモリ (MB)"
        name="memory-gb"
        type="number"
        :step="1024"
        v-model="memorySize"
        v-model:attrs="memorySizeAttrs"
        :error="errors.memorySize"
      >
        <template #suffix>
          <span class="form-unit-label">MB</span>
        </template>
      </FormInput>
    </FormSection>
    <FormSelect
      label="バックアップ"
      name="backup-select"
      :pending="backupsPending"
      :error="backupsError"
      :options="backups ?? []"
      placeholder="使用しない"
      :placeholder-value="null"
      v-model="backupId"
      v-model:attrs="backupIdAttrs"
    >
      <template #option="{ option }">
        {{ option.name }} ({{
          convertByteToUnit(option.targetVirtualStorage.size ?? 0, "GB")
        }}GB)
      </template>
    </FormSelect>

    <FormSection title="ストレージ設定">
      <table class="w-full">
        <thead>
          <tr class="text-sm font-semibold text-gray-600">
            <th class="w-[5%] px-1 py-2 text-center">No.</th>
            <th class="w-[33%] px-1 py-2">名前</th>
            <th class="w-[25%] px-1 py-2">サイズ</th>
            <th class="w-[37%] px-1 py-2">ストレージプール</th>
            <th class="w-8"></th>
          </tr>
        </thead>
        <tbody>
          <StorageRow
            v-for="(field, index) in storageFields"
            :key="field.key"
            :index="index"
            :pools="storagePools"
            :errors="errors"
            :pools-pending="poolsPending"
            :pools-error="poolsError"
            v-model="field.value"
            @remove="removeStorage(index)"
          />
        </tbody>
      </table>

      <div class="section-btn">
        <button type="button" @click="addStorage" class="btn btn-add">
          追加
        </button>
      </div>
    </FormSection>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import FormSection from "../FormSection.vue";

const validationSchema = toTypedSchema(
  z
    .object({
      templateId: z.string().optional().nullable(),
      cpuCores: z.preprocess(
        (val) => (val === "" ? null : val), // 空文字をnullに変換
        z.number({ invalid_type_error: "数値を入力してください。" }).nullable()
      ),
      memorySize: z.preprocess(
        (val) => (val === "" ? null : val), // 空文字をnullに変換
        z.number({ invalid_type_error: "数値を入力してください。" }).nullable()
      ),
      backupId: z.string().nullable(),
      storages: z
        .array(
          z.object({
            id: z.union([z.string(), z.number()]), // idプロパティを追加
            name: z.string().min(1, "名前は必須です。"),
            size: z
              .number({ invalid_type_error: "サイズは必須です。" })
              .int("整数で入力してください。")
              .min(1, "1以上の値を入力してください。"),
            poolId: z
              .string({
                required_error: "プールを選択してください。",
                invalid_type_error: "プールを選択してください。",
              })
              .min(1, "プールを選択してください。"),
            type: z.string(),
          })
        )
        .min(1),
    })
    .superRefine((data, ctx) => {
      if (!data.templateId) {
        if (
          data.cpuCores == null ||
          data.cpuCores < 1 ||
          !Number.isInteger(data.cpuCores)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "1以上の整数を入力してください。",
            path: ["cpuCores"],
          });
        }
        if (
          data.memorySize == null ||
          data.memorySize < 1 ||
          !Number.isInteger(data.memorySize)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "1以上の整数を入力してください。",
            path: ["memorySize"],
          });
        }
      }
    })
);

// (useFormは変更なし)
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    cpuCores: 2,
    memorySize: 2048,
    backupId: null,
    storages: [
      { id: 1, name: "OS", size: 20, poolId: "", type: "os" as const },
    ],
  },
});

// (defineField, useFieldArray, defineExposeは変更なし)
const [templateId, templateIdAttrs] = defineField("templateId");
const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySize, memorySizeAttrs] = defineField("memorySize");
const [backupId, backupIdAttrs] = defineField("backupId");
const {
  fields: storageFields,
  push: pushStorage,
  remove: removeStorage,
} = useFieldArray<any>("storages");
defineExpose({ formData: values, isValid: meta });

// (API連携は変更なし)
const {
  data: templates,
  pending: templatesPending,
  error: templatesError,
} = useResourceList<ModelInstanceTypeDTO>("instance-type");
const {
  data: backups,
  pending: backupsPending,
  error: backupsError,
} = useResourceList<BackupDTO>("backup");
const {
  data: storagePools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<StoragePoolDTO>("storage-pool");
let nextStorageId = 2;

// ★★★ 1. `addStorage` 関数を修正 ★★★
const addStorage = () => {
  pushStorage({
    id: nextStorageId++,
    name: "",
    size: 10,
    poolId: "", // "pool-1" から "" に変更
    type: "manual" as const,
  });
};

// ★★★ 2. `watch` 関数を修正 ★★★
watch(backupId, (newBackupId) => {
  const backupIndex = storageFields.value.findIndex(
    (field) => field.value.type === "backup"
  );
  if (backupIndex !== -1) removeStorage(backupIndex);

  if (newBackupId && backups.value) {
    const backupData = backups.value.find((b) => b.id === newBackupId);
    if (backupData) {
      pushStorage({
        id: `backup-${backupData.id}`,
        name: `backup-${backupData.name}`,
        size: convertByteToUnit(
          backupData.targetVirtualStorage?.size ?? 0,
          "GB"
        ),
        poolId: "", // "pool-1" から "" に変更
        type: "backup" as const,
      });
    }
  }
});
</script>
