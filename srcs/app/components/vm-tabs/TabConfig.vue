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
        {{ option.name }} ({{ option.cpuCore }}コア,
        {{ convertByteToUnit(option.memorySize, "MB") }}MB)
      </template>
    </FormSelect>

    <FormSection title="CPU / メモリ" v-if="!values.templateId">
      <FormInput
        label="CPUコア数"
        name="cpu-cores"
        type="number"
        v-model.number="cpuCore"
        v-model:attrs="cpuCoreAttrs"
        :error="errors.cpuCore"
      />

      <FormInput
        label="メモリ (MB)"
        name="memory-gb"
        type="number"
        :step="1024"
        v-model.number="memorySize"
        v-model:attrs="memorySizeAttrs"
        :error="errors.memorySize"
      />
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
import { useResourceList } from "~/composables/useResourceList";

/**
 * ==============================================================================
 * Validation Schema (バリデーションスキーマ)
 * ------------------------------------------------------------------------------
 * このフォームの入力ルールをZodで定義します。
 * vee-validateと連携するために`toTypedSchema`でラップします。
 * ==============================================================================
 */
const storageSchema = z.object({
  id: z.number().or(z.string()),
  name: z.string().min(1, "名前は必須です。"),
  size: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .number({
        message: "サイズは必須です。",
      })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。")
  ),
  poolId: z
    .string({ message: "プールを選択してください。" })
    .min(1, "プールを選択してください。"),
  type: z.string().optional(),
});

const baseSchema = z
  .object({
    templateId: z.string().optional().nullable(),
    cpuCore: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number({ message: "数値を入力してください。" }).nullable()
    ),
    memorySize: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number({ message: "数値を入力してください。" }).nullable()
    ),
    backupId: z.string().optional().nullable(),
    storages: z.array(storageSchema),
  })
  .superRefine((data, context) => {
    // テンプレートが選択されている場合は、以降のチェックは不要
    if (data.templateId) {
      return;
    }

    // --- CPUコア数のチェック ---
    if (data.cpuCore == null) {
      // まず、nullまたはundefinedでないことを確認
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPUコア数は必須です。",
        path: ["cpuCore"],
      });
    } else if (!Number.isInteger(data.cpuCore) || data.cpuCore < 1) {
      // 次に、1以上の整数であるかを確認
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "1以上の整数を入力してください。",
        path: ["cpuCore"],
      });
    }

    // --- メモリサイズのチェック ---
    if (data.memorySize == null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "メモリサイズは必須です。",
        path: ["memorySize"],
      });
    } else if (!Number.isInteger(data.memorySize) || data.memorySize < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "1MB以上の整数を入力してください。",
        path: ["memorySize"],
      });
    }
  });

/**
 * 型の生成
 */
type Storage = z.infer<typeof storageSchema>;
type FormValues = z.infer<typeof baseSchema>;

const validationSchema = toTypedSchema(baseSchema);

/**
 * ==============================================================================
 * Form State Management (フォーム状態管理)
 * ------------------------------------------------------------------------------
 * VeeValidateのuseFormを使って、フォーム全体をリアクティブに管理します。
 * ==============================================================================
 */
const { errors, defineField, values, meta } = useForm<FormValues>({
  validationSchema,
  initialValues: {
    cpuCore: 2, // ★ cpuCoreに修正
    memorySize: 2048,
    backupId: null,
    storages: [
      { id: 1, name: "OS", size: 32, poolId: "", type: "os" as const },
    ],
  },
});

// 各フォームフィールドとVeeValidateを連携
const [templateId, templateIdAttrs] = defineField("templateId");
const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
const [memorySize, memorySizeAttrs] = defineField("memorySize");
const [backupId, backupIdAttrs] = defineField("backupId");

// useFieldArrayで動的なストレージ行を管理
const {
  fields: storageFields,
  push: pushStorage,
  remove: removeStorage,
} = useFieldArray<Storage>("storages");

// 親コンポーネントにフォームデータとバリデーション状態を公開
defineExpose({ formData: values, isValid: meta });

/**
 * ==============================================================================
 * API Data Fetching (APIデータ取得)
 * ------------------------------------------------------------------------------
 * 各種プルダウンの選択肢をAPIから非同期で取得します。
 * ==============================================================================
 */
const {
  data: templates,
  pending: templatesPending,
  error: templatesError,
} = useResourceList<InstanceTypeResponse>("instance-types");
const {
  data: backups,
  pending: backupsPending,
  error: backupsError,
} = useResourceList<BackupResponse>("backups");
const {
  data: storagePools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<StoragePoolResponse>("storage-pools");

/**
 * ==============================================================================
 * UI Logic (UIロジック)
 * ------------------------------------------------------------------------------
 * ユーザー操作に応じたインタラクティブな挙動を定義します。
 * ==============================================================================
 */
let nextStorageId = 2; // 手動追加するストレージ行のための一意なID

/**
 * 新しい空のストレージ行をフォームに追加します。
 */
const addStorage = () => {
  pushStorage({
    id: nextStorageId++,
    name: "",
    size: 10,
    poolId: "",
    type: "manual" as const,
  });
};

/**
 * バックアップの選択状態を監視し、ストレージ行を自動的に追加・削除します。
 * @param {string | null} newBackupId - 新しく選択されたバックアップのID
 */
watch(backupId, (newBackupId) => {
  // 既存のバックアップ行があれば先に削除
  const existingBackupRowIndex = storageFields.value.findIndex(
    (field) => field.value.type === "backup"
  );
  if (existingBackupRowIndex !== -1) {
    removeStorage(existingBackupRowIndex);
  }

  // 新しいバックアップが選択された場合、対応するストレージ行を追加
  if (newBackupId && backups.value) {
    const selectedBackupData = backups.value.find((b) => b.id === newBackupId);
    if (selectedBackupData) {
      pushStorage({
        id: `backup-${selectedBackupData.id}`,
        name: `backup-${selectedBackupData.name}`,
        size: convertByteToUnit(
          selectedBackupData.targetStorage?.size ?? 0,
          "GB"
        ),
        poolId: "", // プールはユーザーに選択させる
        type: "backup" as const,
      });
    }
  }
});
</script>
