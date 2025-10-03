<template>
  <div class="space-y-6">
    <div>
      <label for="template-select" class="form-label">テンプレート</label>
      <div v-if="templatesPending">...</div>
      <div v-else-if="templatesError">...</div>
      <select
        v-else
        id="template-select"
        v-model="templateId"
        v-bind="templateIdAttrs"
        class="form-input"
      >
        <option :value="undefined">使用しない</option>
        <option
          v-for="template in templates"
          :key="template.id"
          :value="template.id"
        >
          {{ template.name }} ({{ template.cpuCores }}コア,
          {{ template.memorySize / 1024 / 1024 / 1024 }}GB)
        </option>
      </select>
    </div>
    <div v-if="!values.templateId" class="form-section space-y-4">
      <h3 class="section-title">CPU / メモリ</h3>
      <div>
        <label for="cpu-cores" class="form-label-sm">CPUコア数</label>
        <input
          type="number"
          id="cpu-cores"
          v-model="cpuCores"
          v-bind="cpuCoresAttrs"
          class="form-input"
          :class="{ 'border-red-500': errors.cpuCores }"
          min="1"
        />
        <p v-if="errors.cpuCores" class="text-red-500 text-sm mt-1">
          {{ errors.cpuCores }}
        </p>
      </div>
      <div>
        <label for="memory-gb" class="form-label-sm">メモリ (GB)</label>
        <input
          type="number"
          id="memory-gb"
          v-model="memorySize"
          v-bind="memorySizeAttrs"
          class="form-input"
          :class="{ 'border-red-500': errors.memorySize }"
          min="1"
        />
        <p v-if="errors.memorySize" class="text-red-500 text-sm mt-1">
          {{ errors.memorySize }}
        </p>
      </div>
    </div>
    <div>
      <label for="backup-select" class="form-label">バックアップ</label>
      <div v-if="backupsPending">...</div>
      <div v-else-if="backupsError">...</div>
      <select
        v-else
        id="backup-select"
        v-model="backupId"
        v-bind="backupIdAttrs"
        class="form-input"
      >
        <option :value="null">使用しない</option>
        <option v-for="backup in backups" :key="backup.id" :value="backup.id">
          {{ backup.name }} ({{
            (backup.size / 1024 / 1024 / 1024).toFixed(1)
          }}GB)
        </option>
      </select>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-2">ストレージ設定</h3>
      <div class="storage-grid text-sm font-semibold text-gray-600 px-2">
        <div class="col-span-1">#</div>
        <div class="col-span-4">名前</div>
        <div class="col-span-3">サイズ</div>
        <div class="col-span-4">ストレージプール</div>
      </div>
      <div
        v-for="(field, index) in storageFields"
        :key="field.key"
        class="storage-grid"
      >
        <div class="col-span-1 text-center font-medium text-gray-600">
          {{ index + 1 }}.
        </div>
        <div class="col-span-4">
          <input
            type="text"
            v-model="field.value.name"
            :disabled="field.value.type !== 'manual'"
            class="form-input"
            :class="{ 'border-red-500': errors[`storages[${index}].name`] }"
          />
          <p
            v-if="errors[`storages[${index}].name`]"
            class="text-red-500 text-sm mt-1"
          >
            {{ errors[`storages[${index}].name`] }}
          </p>
        </div>
        <div class="col-span-2">
          <input
            type="number"
            v-model.number="field.value.size"
            :disabled="field.value.type !== 'manual'"
            class="form-input"
            :class="{ 'border-red-500': errors[`storages[${index}].size`] }"
            min="1"
          />
          <p
            v-if="errors[`storages[${index}].size`]"
            class="text-red-500 text-sm mt-1"
          >
            {{ errors[`storages[${index}].size`] }}
          </p>
        </div>
        <div class="self-center">GB</div>
        <div class="col-span-3">
          <div v-if="poolsPending" class="text-sm">...</div>
          <div v-else-if="poolsError" class="text-sm text-red-500">...</div>
          <select
            v-else
            v-model="field.value.poolId"
            class="form-input"
            :class="{ 'border-red-500': errors[`storages[${index}].poolId`] }"
          >
            <option
              v-for="pool in storagePools"
              :key="pool.id"
              :value="pool.id"
            >
              {{ pool.name }}
            </option>
          </select>
          <p
            v-if="errors[`storages[${index}].poolId`]"
            class="text-red-500 text-sm mt-1"
          >
            {{ errors[`storages[${index}].poolId`] }}
          </p>
        </div>
        <div class="col-span-1 flex justify-center">
          <button
            v-if="field.value.type !== 'os'"
            type="button"
            @click="removeStorage(index)"
            class="text-red-500 hover:text-red-700 font-bold text-xl"
          >
            &times;
          </button>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button type="button" @click="addStorage" class="btn-secondary">
          追加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// (型定義は変更なし)
interface ModelInstanceTypeDTO {
  id: string;
  name: string;
  cpuCores: number;
  memorySize: number;
  storageSize: number;
}
interface ModelBackupDTO {
  id: string;
  name: string;
  size: number;
}
interface ModelStoragePoolDTO {
  id: string;
  name: string;
}

// ★★★ 1. バリデーションスキーマを修正 ★★★
const validationSchema = toTypedSchema(
  z
    .object({
      templateId: z.string().optional().nullable(),
      cpuCores: z.number().nullable(), // .nullable() を追加
      memorySize: z.number().nullable(), // .nullable() を追加
      backupId: z.string().nullable(),
      storages: z
        .array(
          z.object({
            name: z.string().min(1, "名前は必須です。"),
            size: z
              .number({ invalid_type_error: "サイズは必須です。" })
              .int("整数で入力してください。")
              .min(1, "1以上の値を入力してください。"),
            poolId: z.string({ required_error: "プールを選択してください。" }),
            type: z.string(),
          })
        )
        .min(1),
    })
    .superRefine((data, ctx) => {
      if (!data.templateId) {
        if (
          !data.cpuCores ||
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
          !data.memorySize ||
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

const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    templateId: undefined,
    cpuCores: null, // 初期値を null に変更
    memorySize: null, // 初期値を null に変更
    backupId: null,
    storages: [
      { id: 1, name: "OS", size: 20, poolId: "pool-1", type: "os" as const },
    ],
  },
});

// (defineFieldとuseFieldArrayは変更なし)
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

// (API連携、UI操作のロジックは変更なし)
const {
  data: templates,
  pending: templatesPending,
  error: templatesError,
} = useResourceList<ModelInstanceTypeDTO>("instance-type");
const {
  data: backups,
  pending: backupsPending,
  error: backupsError,
} = useResourceList<ModelBackupDTO>("backup");
const {
  data: storagePools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<ModelStoragePoolDTO>("storage-pool");
let nextStorageId = 2;
const addStorage = () => {
  pushStorage({
    id: nextStorageId++,
    name: "",
    size: 10,
    poolId: "pool-1",
    type: "manual" as const,
  });
};
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
        size: Math.round(backupData.size / 1024 / 1024 / 1024),
        poolId: "pool-1",
        type: "backup" as const,
      });
    }
  }
});
</script>

<style scoped>
.form-section {
  @apply p-4 border border-gray-200 rounded-lg;
}
.section-title {
  @apply font-semibold text-gray-800;
}
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-label-sm {
  @apply block mb-1.5 text-sm font-medium text-gray-600;
}
.input-label-xs {
  @apply block text-xs text-gray-500 mb-1;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.form-input:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300;
}
.storage-grid {
  @apply grid grid-cols-12 gap-x-3 gap-y-1 items-start mb-2;
}
</style>
