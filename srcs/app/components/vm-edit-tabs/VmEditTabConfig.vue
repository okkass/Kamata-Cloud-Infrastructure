<template>
  <div class="space-y-6">
    <div class="form-section space-y-4">
      <h3 class="section-title">CPU / メモリ</h3>
      <div>
        <label for="vm-edit-cpu-cores" class="form-label-sm">CPUコア数</label>
        <input
          type="number"
          id="vm-edit-cpu-cores"
          v-model.number="cpuCores"
          v-bind="cpuCoresAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.cpuCores }"
          min="1"
        />
        <p v-if="errors.cpuCores" class="text-error mt-1">
          {{ errors.cpuCores }}
        </p>
      </div>
      <div>
        <label for="vm-edit-memory-gb" class="form-label-sm">メモリ (GB)</label>
        <input
          type="number"
          id="vm-edit-memory-gb"
          v-model.number="memorySize"
          v-bind="memorySizeAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.memorySize }"
          min="1"
        />
        <p v-if="errors.memorySize" class="text-error mt-1">
          {{ errors.memorySize }}
        </p>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-2">ストレージ設定</h3>

      <div class="storage-grid text-sm font-semibold text-gray-600 px-2">
        <div class="col-span-1">No.</div>
        <div class="col-span-4">名前</div>
        <div class="col-span-3">サイズ (GB)</div>
        <div class="col-span-4">ストレージプール</div>
      </div>

      <div
        v-for="(field, index) in storageFields"
        :key="field.key"
        class="storage-grid"
      >
        <div class="col-span-1 text-center font-medium text-gray-600 pt-2">
          {{ index + 1 }}.
        </div>

        <div class="col-span-4">
          <input
            type="text"
            v-model="field.value.name"
            class="form-input"
            :class="{ 'form-border-error': errors[`storages[${index}].name`] }"
            :disabled="field.value.type === 'os'"
            placeholder="例: data-disk-01"
          />
          <p v-if="errors[`storages[${index}].name`]" class="text-error mt-1">
            {{ errors[`storages[${index}].name`] }}
          </p>
        </div>

        <div class="col-span-3">
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="field.value.size"
              class="form-input"
              :class="{
                'form-border-error': errors[`storages[${index}].size`],
              }"
              min="1"
            />
            <span class="text-gray-600">GB</span>
          </div>
          <p v-if="errors[`storages[${index}].size`]" class="text-error mt-1">
            {{ errors[`storages[${index}].size`] }}
          </p>
        </div>

        <div class="col-span-3">
          <FormSelect
            :label="undefined"
            :name="`storage-pool-${index}`"
            v-model="field.value.poolId"
            :options="storagePools ?? []"
            option-value="id"
            option-label="name"
            placeholder="プールを選択"
            :pending="poolsPending"
            :error="poolsError"
            :error-message="errors[`storages[${index}].poolId`]"
            :required="true"
            :placeholder-value="undefined"
            :disabled="field.value.type === 'os'"
          />
        </div>

        <div class="col-span-1 flex justify-center items-center">
          <button
            v-if="field.value.type !== 'os'"
            type="button"
            @click="removeStorage(index)"
            class="btn-icon-danger"
            title="ストレージを削除"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.977 0c-.043.051-.084.102-.125.153m12.702 0c.043.051.084.102.125.153m-12.452 0c-.342.052-.682.107-1.022.166"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button type="button" @click="addStorage" class="btn-secondary">
          ストレージを追加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * VM編集モーダル: 構成タブ (VmEditTabConfig.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、VM編集モーダルの「構成」タブのUIとフォームロジックを
 * 自己完結して管理します。
 * (注: このバージョンは instanceTypeId (テンプレート) を含みません)
 * * 責務:
 * 1. 自身のフォーム (CPU/メモリ/ストレージ配列) の状態とバリデーションを管理する。
 * 2. フォームに必要なデータ (ストレージプール一覧) をAPIから取得する。
 * 3. 親コンポーネントが必要とするインターフェース (validate, resetForm, etc.) を
 * `defineExpose` で公開する。
 * =================================================================================
 */
import { computed } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
// ★ 共通コンポーネントをインポート
import FormSelect from "~/components/FormSelect.vue";
// ★ 共有型定義をインポート
import type {
  LocalStoragePoolDTO,
  NetworkStoragePoolDTO,
} from "~~/shared/types/storage-pools"; //

// ==============================================================================
// Props (親からの初期値)
// ==============================================================================
// ★ このフォームで扱うストレージの型
interface StorageFieldData {
  id: string | null;
  name: string;
  size: number;
  poolId: string;
  type: "os" | "manual";
}
// ★ 親(useVirtualMachineEdit)から渡される初期データ
const props = defineProps<{
  initialData?: {
    // (instanceTypeId はこのファイルでは使用しない)
    cpuCores: number;
    memorySize: number;
    storages: StorageFieldData[];
  };
}>();

// ==============================================================================
// API (ドロップダウン用データ取得)
// ==============================================================================

// ストレージプール一覧の取得 (ローカル + ネットワーク)
const {
  data: localPools,
  pending: localPoolsPending,
  error: localPoolsError,
} = useResourceList<LocalStoragePoolDTO>("storage-pools/local");
const {
  data: networkPools,
  pending: networkPoolsPending,
  error: networkPoolsError,
} = useResourceList<NetworkStoragePoolDTO>("storage-pools/network");

// マージしたストレージプールリスト
const storagePools = computed(() => [
  ...(localPools.value || []),
  ...(networkPools.value || []),
]);
const poolsPending = computed(
  () => localPoolsPending.value || networkPoolsPending.value
);
const poolsError = computed(
  () => localPoolsError.value || networkPoolsError.value
);

// ==============================================================================
// バリデーションスキーマ (Zod)
// ==============================================================================
// ストレージ配列の各要素のスキーマ
const storageSchema = z.object({
  id: z.string().nullable(), // 既存ストレージのID (新規の場合は null)
  name: z.string().min(1, "名前は必須です。"),
  size: z
    .number({ invalid_type_error: "サイズは必須です。" })
    .int("整数で入力してください。")
    .min(1, "1GB以上の値を入力してください。"),
  poolId: z.string({ required_error: "プールを選択してください。" }),
  type: z.string(), // 'os' または 'manual' (バリデーション対象外)
});
// ★ 'any' を排除するため、Zodスキーマから型を推論
type StorageField = z.infer<typeof storageSchema>;

// タブ全体のスキーマ
const validationSchema = toTypedSchema(
  z.object({
    cpuCores: z
      .number({ invalid_type_error: "CPUコア数は必須です。" })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    memorySize: z
      .number({ invalid_type_error: "メモリは必須です。" })
      .int("整数で入力してください。")
      .min(1, "1GB以上の値を入力してください。"),
    storages: z
      .array(storageSchema)
      .min(1, "少なくともOSディスクが1つ必要です。"),
  })
);

// ==============================================================================
// フォーム設定 (VeeValidate)
// ==============================================================================
const { errors, defineField, values, meta, resetForm, validate } = useForm({
  validationSchema,
  // ★ 親から渡された initialData を initialValues に設定
  initialValues: {
    cpuCores: props.initialData?.cpuCores || 1,
    memorySize: props.initialData?.memorySize || 1,
    storages: props.initialData?.storages || [],
  },
});

// CPU/メモリのフィールド
const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySize, memorySizeAttrs] = defineField("memorySize");

// ストレージの動的配列 (useFieldArray)
const {
  fields: storageFields,
  push: pushStorage,
  remove: removeStorage,
} = useFieldArray<StorageField>("storages"); // ★ any を StorageField に変更

// ==============================================================================
// UI操作 (ストレージ追加/削除)
// ==============================================================================
// のロジックを修正
const addStorage = () => {
  pushStorage({
    id: null, // ★ 新規ストレージにはIDはない (APIが採番する)
    name: "new-storage",
    size: 10, // デフォルトサイズ
    poolId: undefined as any, // ★ FormSelect の placeholder のため undefined に
    type: "manual", // OSディスク以外は 'manual'
  });
};

// ==============================================================================
// Expose (親へのインターフェース公開)
// ==============================================================================
defineExpose({
  validate, // バリデーション実行関数
  resetForm, // (親は使わないが、念のため公開)
  values, // フォームの現在の値 (ref)
  meta, // フォームのバリデーション状態 (ref)
});
</script>

<style scoped>
.form-section {
  @apply p-4 border border-gray-200 rounded-lg;
}
.section-title {
  @apply font-semibold text-gray-800;
}
.form-label-sm {
  @apply block mb-1.5 text-sm font-medium text-gray-600;
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

/* 削除ボタンのスタイル (btn-icon-danger) */
/* (共通CSSに定義がないと仮定し、ここで定義) */
.btn-icon-danger {
  @apply p-1.5 text-gray-400 rounded-md transition-colors;
  @apply hover:text-red-600 hover:bg-red-100;
  @apply focus:outline-none focus:ring-2 focus:ring-red-400;
}
</style>
