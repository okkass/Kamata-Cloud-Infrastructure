<template>
  <div class="modal-space">
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
          {{ convertByteToUnit(template.memorySize, "MB") }}MB)
        </option>
      </select>
    </div>
    <div v-if="!values.templateId" class="section-form modal-space">
      <h3 class="section-title">CPU / メモリ</h3>

      <FormInput
        label="CPUコア数"
        name="cpu-cores"
        type="number"
        v-model="cpuCores"
        v-model:attrs="cpuCoresAttrs"
        :error="errors.cpuCores"
      />

      <FormInput
        label="メモリ (MB)"
        name="memory-gb"
        type="number"
        v-model="memorySize"
        v-model:attrs="memorySizeAttrs"
        :error="errors.memorySize"
      />
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
            convertByteToUnit(backup.targetVirtualStorage.size ?? 0, "GB")
          }}GB)
        </option>
      </select>
    </div>

    <div class="section-form">
      <h3 class="section-title mb-2">ストレージ設定</h3>
      <div class="storage-grid text-sm font-semibold text-gray-600 px-2">
        <div class="col-span-1">No.</div>
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
            :disabled="field.value.type === 'backup'"
            class="form-input"
            :class="{ 'form-border-error': errors[`storages[${index}].name`] }"
          />
          <p v-if="errors[`storages[${index}].name`]" class="text-error">
            {{ errors[`storages[${index}].name`] }}
          </p>
        </div>
        <div class="col-span-2">
          <input
            type="number"
            v-model.number="field.value.size"
            :disabled="field.value.type === 'backup'"
            class="form-input"
            :class="{ 'form-border-error': errors[`storages[${index}].size`] }"
            min="1"
          />
          <p v-if="errors[`storages[${index}].size`]" class="text-error">
            {{ errors[`storages[${index}].size`] }}
          </p>
        </div>
        <div class="self-center">GB</div>
        <div class="col-span-3">
          <div v-if="poolsPending" class="text-loading">...</div>
          <div v-else-if="poolsError" class="text-error">...</div>
          <select
            v-else
            v-model="field.value.poolId"
            class="form-input"
            :class="{
              'form-border-error': errors[`storages[${index}].poolId`],
            }"
          >
            <option :value="null" disabled>選択してください</option>
            <option
              v-for="pool in storagePools"
              :key="pool.id"
              :value="pool.id"
            >
              {{ pool.name }}
            </option>
          </select>
          <p v-if="errors[`storages[${index}].poolId`]" class="text-error">
            {{ errors[`storages[${index}].poolId`] }}
          </p>
        </div>
        <div class="col-span-1 flex mt-4 items-center">
          <button
            v-if="field.value.type !== 'os'"
            type="button"
            @click="removeStorage(index)"
            class="btn-cross-delete"
          >
            <icon-cross />
          </button>
        </div>
      </div>
      <div class="section-btn">
        <button type="button" @click="addStorage" class="btn-add">追加</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const validationSchema = toTypedSchema(
  z
    .object({
      templateId: z.string().optional().nullable(),
      cpuCores: z.number().nullable(),
      memorySize: z.number().nullable(),
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
            poolId: z.string().min(1, "プールを選択してください。"), // poolIdはnull不可
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
    templateId: undefined,
    cpuCores: null,
    memorySize: null,
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
