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
            @remove="removeStorageRow(index)"
          />
        </tbody>
      </table>

      <div class="section-btn">
        <button type="button" @click="addNewStorageRow" class="btn btn-add">
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
import FormSection from "../FormSection.vue"; // セクション用の共通コンポーネント

// ==============================================================================
// Validation Schema
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const validationSchema = toTypedSchema(
  z
    .object({
      templateId: z.string().optional().nullable(),
      // preprocessを使って、入力が空文字の場合にバリデーション前にnullに変換します
      cpuCores: z.preprocess(
        (val) => (val === "" ? null : val),
        z.number({ invalid_type_error: "数値を入力してください。" }).nullable()
      ),
      memorySize: z.preprocess(
        (val) => (val === "" ? null : val),
        z.number({ invalid_type_error: "数値を入力してください。" }).nullable()
      ),
      backupId: z.string().nullable(),
      // ストレージ設定は、オブジェクトの配列として定義します
      storages: z
        .array(
          z.object({
            id: z.union([z.string(), z.number()]),
            name: z.string().min(1, "名前は必須です。"),
            size: z
              .number({ invalid_type_error: "サイズは必須です。" })
              .int("整数で入力してください。")
              .min(1, "1以上の値を入力してください。"),
            poolId: z
              .string({ required_error: "プールを選択してください。" })
              .min(1, "プールを選択してください。"), // 空文字でないこともチェック
            type: z.string(),
          })
        )
        .min(1), // ストレージは最低1行必要です
    })
    // superRefineを使って、複数のフィールドにまたがる複雑なバリデーションを定義します
    .superRefine((data, context) => {
      // テンプレートが選択されていない場合のみ、CPUとメモリのバリデーションを実行します
      if (!data.templateId) {
        if (
          data.cpuCores == null ||
          data.cpuCores < 1 ||
          !Number.isInteger(data.cpuCores)
        ) {
          context.addIssue({
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
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "1以上の整数を入力してください。",
            path: ["memorySize"],
          });
        }
      }
    })
);

// ==============================================================================
// Form Setup
// VeeValidateのuseFormを使って、フォーム全体を管理します。
// ==============================================================================
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

// 各フォームフィールドとVeeValidateを連携させます
const [templateId, templateIdAttrs] = defineField("templateId");
const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySize, memorySizeAttrs] = defineField("memorySize");
const [backupId, backupIdAttrs] = defineField("backupId");

// useFieldArrayを使って、動的なストレージ行の配列を管理します
const {
  fields: storageFields,
  push: addStorageRow,
  remove: removeStorageRow,
} = useFieldArray<any>("storages");

// 親コンポーネントにフォームデータと状態を公開します
defineExpose({ formData: values, isValid: meta });

// ==============================================================================
// API Data Fetching
// 各種プルダウンの選択肢をAPIから取得します。
// ==============================================================================
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

// ==============================================================================
// UI Logic
// ユーザー操作に応じた挙動を定義します。
// ==============================================================================
let nextStorageId = 2; // 手動追加するストレージ行の一意なIDを管理

/**
 * 新しい空のストレージ行を追加します。
 */
const addNewStorageRow = () => {
  addStorageRow({
    id: nextStorageId++,
    name: "",
    size: 10,
    poolId: "",
    type: "manual" as const,
  });
};

/**
 * バックアップの選択状態を監視し、ストレージ行を自動的に追加・削除します。
 */
watch(backupId, (newBackupId) => {
  // 既存のバックアップ行があれば削除
  const existingBackupRowIndex = storageFields.value.findIndex(
    (field) => field.value.type === "backup"
  );
  if (existingBackupRowIndex !== -1) {
    removeStorageRow(existingBackupRowIndex);
  }

  // 新しいバックアップが選択された場合、対応するストレージ行を追加
  if (newBackupId && backups.value) {
    const selectedBackupData = backups.value.find((b) => b.id === newBackupId);
    if (selectedBackupData) {
      addStorageRow({
        id: `backup-${selectedBackupData.id}`,
        name: `backup-${selectedBackupData.name}`,
        size: convertByteToUnit(
          selectedBackupData.targetVirtualStorage?.size ?? 0,
          "GB"
        ),
        poolId: "", // プールはユーザーに選択させる
        type: "backup" as const,
      });
    }
  }
});
</script>
