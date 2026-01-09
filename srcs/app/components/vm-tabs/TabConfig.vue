<template>
  <div class="modal-space space-y-6">
    <FormSelect
      label="テンプレート"
      name="templateId"
      :options="templates ?? []"
      :option-label="getTemplateLabel"
      option-value="id"
      :pending="templatesPending"
      :error="templatesError"
      placeholder="使用しない（カスタム構成）"
      v-model="templateId"
      v-bind="templateIdAttrs"
    />

    <FormSection title="CPU / メモリ" v-if="!values.templateId">
      <div class="grid grid-cols-2 gap-4">
        <FormInput
          label="CPUコア数"
          name="cpuCore"
          type="number"
          v-model.number="cpuCore"
          v-bind="cpuCoreAttrs"
          :error="errors.cpuCore"
          placeholder="例: 2"
        />

        <FormInput
          label="メモリ (MB)"
          name="memorySize"
          type="number"
          :step="1024"
          v-model.number="memorySize"
          v-bind="memorySizeAttrs"
          :error="errors.memorySize"
          placeholder="例: 2048"
        />
      </div>
    </FormSection>

    <FormSelect
      label="バックアップから復元（任意）"
      name="backupId"
      :options="backups ?? []"
      option-label="name"
      option-value="id"
      :pending="backupsPending"
      :error="backupsError"
      placeholder="使用しない"
      v-model="backupId"
      v-bind="backupIdAttrs"
    />

    <FormSection title="ストレージ構成">
      <StorageConfigTable
        :storages="displayStorages"
        :storage-pools="storagePools ?? []"
        :errors="errors"
        field-name-prefix="storages"
        @add="addStorage"
        @remove="removeStorage"
      />
    </FormSection>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 構成タブ (TabConfig.vue)
 * =================================================================================
 */
import { computed, watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { vmConfigSchema } from "~/utils/validations/virtual-machine";
import { convertByteToUnit } from "~/utils/format";
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";
import FormSection from "~/components/Form/Section.vue";
import StorageConfigTable from "~/components/StorageConfigTable.vue";

/**
 * ==============================================================================
 * Validation Schema
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  vmConfigSchema.superRefine((data, ctx) => {
    if (!data.templateId) {
      if (!data.cpuCore) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cpuCore"],
          message: "CPUコア数は必須です",
        });
      }
      if (!data.memorySize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["memorySize"],
          message: "メモリサイズは必須です",
        });
      }
    }
    // ストレージは1つ以上必須
    if (data.storages.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["storages"],
        message: "少なくとも1つのストレージが必要です",
      });
    }
  })
);

type ConfigFormValues = z.infer<typeof vmConfigSchema>;

/**
 * ==============================================================================
 * Form State Management
 * ==============================================================================
 */
const { errors, defineField, values, meta } = useForm<ConfigFormValues>({
  validationSchema,
  initialValues: {
    templateId: undefined,
    cpuCore: 2,
    memorySize: 2048,
    backupId: null,
    storages: [
      { id: "new-0", name: "root-disk", size: 20, poolId: "", type: "manual" },
    ],
  },
});

const [templateId, templateIdAttrs] = defineField("templateId");
const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
const [memorySize, memorySizeAttrs] = defineField("memorySize");
const [backupId, backupIdAttrs] = defineField("backupId");

// ストレージ配列の管理
const {
  fields: storageFields,
  push: pushStorage,
  remove: removeStorage,
} = useFieldArray("storages");

/**
 * ==============================================================================
 * API Data Fetching
 * ==============================================================================
 */
// 1. インスタンスタイプ
const {
  data: templates,
  pending: templatesPending,
  error: templatesError,
} = useResourceList<InstanceTypeResponse>(INSTANCE_TYPE.name);

// 2. バックアップ
const {
  data: backups,
  pending: backupsPending,
  error: backupsError,
} = useResourceList<BackupResponse>(BACKUP.name);

// 3. ストレージプール
const {
  data: storagePools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<StoragePoolResponse>(STORAGE.name);

/**
 * ==============================================================================
 * UI Logic & Helpers
 * ==============================================================================
 */

// ストレージ行のアンラップ
const displayStorages = computed(() => {
  return storageFields.value.map((field: any) => {
    return field && typeof field === "object" && "value" in field
      ? field.value
      : field;
  });
});

// テンプレート選択時に CPU/メモリ を自動設定
watch(templateId, (newId) => {
  if (newId && templates.value) {
    const tpl = templates.value.find((t) => t.id === newId);
    if (tpl) {
      cpuCore.value = tpl.cpuCore;
      memorySize.value = convertByteToUnit(tpl.memorySize, "MB");
    }
  }
});

let nextStorageId = 100;

// 手動ストレージ追加
const addStorage = () => {
  pushStorage({
    id: `new-${nextStorageId++}`,
    name: `disk-${storageFields.value.length + 1}`,
    size: 20,
    poolId: "",
    type: "manual",
  });
};

// バックアップ選択時のストレージ同期
watch(backupId, (newBackupId) => {
  // 既存のバックアップ由来行を削除
  const indiciesToRemove: number[] = [];
  storageFields.value.forEach((field: any, idx: number) => {
    const val = field.value || field;
    if (val.type === "backup") indiciesToRemove.push(idx);
  });
  for (let i = indiciesToRemove.length - 1; i >= 0; i--) {
    const indexToRemove = indiciesToRemove[i];
    if (indexToRemove !== undefined) {
      removeStorage(indexToRemove);
    }
  }

  // 新しいバックアップ行を追加
  if (newBackupId && backups.value) {
    const backup = backups.value.find((b) => b.id === newBackupId);
    if (backup) {
      pushStorage({
        id: `backup-${backup.id}`,
        name: backup.name,
        size: convertByteToUnit(backup.size, "GB"),
        poolId: "",
        type: "backup",
      });
    }
  }
});

/**
 * テンプレート選択時の表示ラベル生成
 */
const getTemplateLabel = (tpl: any): string => {
  // tpl.memorySize が unknown と判定されるのを防ぐため as number を付与
  const memMB = convertByteToUnit(tpl.memorySize as number, "MB");
  return `${tpl.name} (${tpl.cpuCore}vCPU, ${memMB}MB)`;
};

/**
 * ==============================================================================
 * Expose
 * ==============================================================================
 */
defineExpose({
  formData: values,
  isValid: meta,
});
</script>

<style scoped>
.modal-space {
  @apply p-1;
}
</style>
