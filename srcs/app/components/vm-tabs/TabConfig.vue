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
  z
    .object({
      templateId: z.string().optional(),
      cpuCore: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().min(1, "1コア以上を指定してください").optional()
      ),
      memorySize: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().min(512, "512MB以上を指定してください").optional()
      ),
      backupId: z.string().optional().nullable(),
      storages: z.array(
        z.object({
          id: z.any(),
          name: z.string().min(1, "必須"),
          size: z.number().min(1, "1GB以上"),
          poolId: z.string().min(1, "必須"),
          type: z.enum(["manual", "backup"]).default("manual"),
        })
      ),
    })
    .superRefine((data, ctx) => {
      // テンプレート未選択時は CPU/メモリ が必須
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

/**
 * ==============================================================================
 * Form State Management
 * ==============================================================================
 */
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    templateId: undefined,
    cpuCore: 2,
    memorySize: 2048,
    backupId: null,
    storages: [
      { id: 1, name: "root-disk", size: 20, poolId: "", type: "manual" },
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
} = useResourceList<InstanceTypeResponse>("instance-types");

// 2. バックアップ
const {
  data: backups,
  pending: backupsPending,
  error: backupsError,
} = useResourceList<BackupResponse>("backups");

// 3. ストレージプール
const {
  data: storagePools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<StoragePoolResponse>("storage-pools");

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
    id: nextStorageId++,
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
const getTemplateLabel = (tpl: InstanceTypeResponse) => {
  // tpl.memorySize が unknown と判定されるのを防ぐため as number を付与
  const memMB = convertByteToUnit(tpl.memorySize as number, "MB");
  return `${tpl.name} (${tpl.cpuCore}vCPU, ${memMB}MB)`;
};

/**
 * テンプレート選択時に CPU/メモリ を自動設定
 */
watch(templateId, (newId) => {
  if (newId && templates.value) {
    const tpl = templates.value.find((t) => t.id === newId);
    if (tpl) {
      // APIから取得した値が unknown の可能性があるため as number でキャスト
      cpuCore.value = tpl.cpuCore as number;
      memorySize.value = convertByteToUnit(tpl.memorySize as number, "MB");
    }
  }
});

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
