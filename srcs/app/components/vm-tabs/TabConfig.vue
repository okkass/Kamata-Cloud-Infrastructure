<template>
  <div class="modal-space space-y-6">
    <FormSelect
      label="テンプレート"
      name="template-select"
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
          name="cpu-cores"
          type="number"
          v-model.number="cpuCore"
          v-bind="cpuCoreAttrs"
          :error="errors.cpuCore"
          placeholder="例: 2"
        />

        <FormInput
          label="メモリ (MB)"
          name="memory-mb"
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
      name="backup-select"
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
      <div class="border rounded-md overflow-hidden bg-white">
        <div
          class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
        >
          <h3 class="font-bold text-sm text-gray-700">ディスク一覧</h3>
          <button
            type="button"
            @click="addStorage"
            class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"
          >
            + 追加
          </button>
        </div>

        <div class="p-4">
          <div
            v-if="storageFields.length === 0"
            class="text-center text-gray-400 py-4 text-sm"
          >
            ストレージがありません。
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(storage, index) in displayStorages"
              :key="storage.id || index"
              class="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <div class="grid grid-cols-12 gap-2 items-end">
                <div class="col-span-4">
                  <label class="block text-xs text-gray-500 mb-1">名前</label>
                  <input
                    type="text"
                    v-model="storage.name"
                    class="form-input-sm w-full"
                    :class="{ 'border-red-500': getError(index, 'name') }"
                    placeholder="disk-1"
                  />
                </div>

                <div class="col-span-3">
                  <label class="block text-xs text-gray-500 mb-1"
                    >サイズ (GB)</label
                  >
                  <input
                    type="number"
                    v-model.number="storage.size"
                    class="form-input-sm w-full"
                    :class="{ 'border-red-500': getError(index, 'size') }"
                    :disabled="storage.type === 'backup'"
                    :title="
                      storage.type === 'backup'
                        ? 'バックアップ元のサイズに固定されています'
                        : ''
                    "
                  />
                </div>

                <div class="col-span-4">
                  <label class="block text-xs text-gray-500 mb-1"
                    >保存先プール</label
                  >
                  <select
                    v-model="storage.poolId"
                    class="form-select-sm w-full"
                    :class="{ 'border-red-500': getError(index, 'poolId') }"
                  >
                    <option value="" disabled>プールを選択</option>
                    <option
                      v-for="pool in storagePools ?? []"
                      :key="pool.id"
                      :value="pool.id"
                    >
                      {{ pool.name }}
                    </option>
                  </select>
                </div>

                <div class="col-span-1 flex justify-end pb-1">
                  <button
                    type="button"
                    @click="removeStorage(index)"
                    class="text-gray-400 hover:text-red-500 p-1"
                    title="削除"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="w-5 h-5"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mt-1 space-y-1">
                <p v-if="getError(index, 'name')" class="text-xs text-red-500">
                  名前: {{ getError(index, "name") }}
                </p>
                <p v-if="getError(index, 'size')" class="text-xs text-red-500">
                  サイズ: {{ getError(index, "size") }}
                </p>
                <p
                  v-if="getError(index, 'poolId')"
                  class="text-xs text-red-500"
                >
                  プール: {{ getError(index, "poolId") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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

import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";
import FormSection from "~/components/Form/Section.vue";

/**
 * ==============================================================================
 * Validation Schema
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z
    .object({
      templateId: z.string().optional(),
      cpuCore: z.number().min(1, "1コア以上を指定してください").optional(),
      memorySize: z.number().min(512, "512MB以上を指定してください").optional(),
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

// エラー取得ヘルパー
const getError = (index: number, field: string) => {
  const errs = errors.value as Record<string, string | undefined>;
  return (
    errs[`storages[${index}].${field}`] || errs[`storages.${index}.${field}`]
  );
};

// ★★★ 修正: バイト数変換ヘルパー (引数型を緩和し、内部で安全化) ★★★
// number | undefined | null を受け取り、数値でなければ 0 として扱う
const convertByteToUnit = (
  bytes: number | undefined | null,
  unit: "MB" | "GB"
) => {
  const safeBytes = bytes ?? 0; // null/undefined なら 0 に変換

  if (unit === "MB") return Math.round(safeBytes / 1024 / 1024);
  if (unit === "GB") return Math.round(safeBytes / 1024 / 1024 / 1024);
  return safeBytes;
};

// テンプレート選択時の表示ラベル生成
const getTemplateLabel = (tpl: InstanceTypeResponse) => {
  // convertByteToUnit が安全になったので、?? 0 は不要だが念のため
  const memMB = convertByteToUnit(tpl.memorySize, "MB");
  return `${tpl.name} (${tpl.cpuCore}vCPU, ${memMB}MB)`;
};

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
.form-input-sm,
.form-select-sm {
  @apply border border-gray-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white;
}
.form-input-sm:disabled {
  @apply bg-gray-100 text-gray-500 cursor-not-allowed;
}
</style>
