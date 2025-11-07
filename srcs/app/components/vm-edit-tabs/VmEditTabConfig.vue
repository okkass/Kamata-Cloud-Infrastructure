<template>
  <div class="space-y-6">
    <div class="form-section space-y-4">
      <h3 class="section-title">CPU / メモリ</h3>

      <div>
        <FormSelect
          label="インスタンスタイプ (テンプレート)"
          name="vm-edit-instance-type"
          v-model="instanceTypeId"
          :options="instanceTypes ?? []"
          option-value="id"
          option-label="name"
          placeholder="カスタム (手動設定)"
          :pending="instanceTypesPending"
          :error="instanceTypesError"
          :error-message="errors.instanceTypeId"
          :placeholder-value="null"
        />
      </div>

      <div>
        <label for="vm-edit-cpu-cores" class="form-label-sm">CPUコア数</label>
        <input
          type="number"
          id="vm-edit-cpu-cores"
          v-model="cpuCores"
          v-bind="cpuCoresAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.cpuCores }"
          min="1"
          :disabled="isTemplateSelected"
          placeholder="カスタム時のみ入力"
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
          v-model="memorySize"
          v-bind="memorySizeAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.memorySize }"
          min="1"
          :disabled="isTemplateSelected"
          placeholder="カスタム時のみ入力"
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
 * * 責務:
 * 1. 自身のフォーム (CPU/メモリ/インスタンスタイプ/ストレージ配列) の状態と
 * バリデーション (VeeValidate) を管理する。
 * 2. フォームに必要なデータ (インスタンスタイプ一覧, ストレージプール一覧) を
 * API (useResourceList) から取得する。
 * 3. インスタンスタイプ選択とカスタムスペック入力の連動ロジックを管理する。
 * 4. 親コンポーネントが必要とするインターフェース (validate, resetForm, etc.) を
 * `defineExpose` で公開する。
 * =================================================================================
 */
import { ref, computed, watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
// ★ 共通コンポーネントをインポート
import FormSelect from "~/components/FormSelect.vue";
// ★ 共有型定義をインポート
import type { ModelInstanceTypeDTO } from "~~/shared/types/instance-types"; //
import type {
  LocalStoragePoolDTO,
  NetworkStoragePoolDTO,
} from "~~/shared/types/storage-pools"; //

// ==============================================================================
// API (ドロップダウン用データ取得)
// ==============================================================================

// 1. インスタンスタイプ一覧の取得
const {
  data: instanceTypes,
  pending: instanceTypesPending,
  error: instanceTypesError,
} = useResourceList<ModelInstanceTypeDTO>("instance-types");

// 2. ストレージプール一覧の取得 (ローカル + ネットワーク)
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

const validationSchema = toTypedSchema(
  z
    .object({
      // instanceTypeId は null (カスタム) もしくは string (テンプレートID)
      instanceTypeId: z.string().nullable(),
      // instanceTypeId が null (カスタム) の場合のみ cpuCores が必須
      cpuCores: z
        .number({ invalid_type_error: "CPUコア数は必須です。" })
        .int("整数で入力してください。")
        .min(1, "1以上の値を入力してください。")
        .nullable(), // テンプレート選択時は null になり得る
      memorySize: z
        .number({ invalid_type_error: "メモリは必須です。" })
        .int("整数で入力してください。")
        .min(1, "1GB以上の値を入力してください。")
        .nullable(), // テンプレート選択時は null になり得る
      storages: z
        .array(storageSchema)
        .min(1, "少なくともOSディスクが1つ必要です。"),
    })
    .refine(
      (data) => {
        // instanceTypeId が選択されていない (null) 場合、CPUとメモリは必須
        if (data.instanceTypeId === null) {
          return (
            data.cpuCores !== null &&
            data.cpuCores > 0 &&
            data.memorySize !== null &&
            data.memorySize > 0
          );
        }
        return true; // テンプレート選択時はCPU/メモリは問わない
      },
      {
        // このエラーは特定のフィールドに関連付けず、フォーム上部に表示することを想定
        message:
          "カスタム構成の場合はCPUコア数とメモリの両方に1以上を入力してください。",
        path: ["cpuCores"], // 代表して cpuCores にエラーを関連付ける
      }
    )
);

// ==============================================================================
// フォーム設定 (VeeValidate)
// ==============================================================================
const {
  errors,
  defineField,
  values,
  meta,
  resetForm,
  validate,
  setFieldValue,
} = useForm({
  validationSchema,
  initialValues: {
    instanceTypeId: null,
    cpuCores: null,
    memorySize: null,
    storages: [],
  },
});

// CPU/メモリ/インスタンスタイプのフィールド
const [instanceTypeId] = defineField("instanceTypeId");
const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySize, memorySizeAttrs] = defineField("memorySize");

// ストレージの動的配列 (useFieldArray)
const {
  fields: storageFields,
  push: pushStorage,
  remove: removeStorage,
} = useFieldArray<any>("storages"); // 'any' は z.infer<typeof storageSchema> でも可

// ==============================================================================
// 連動ロジック (インスタンスタイプ ⇔ カスタムスペック)
// ==============================================================================

// テンプレート (インスタンスタイプ) が選択されているかどうか
const isTemplateSelected = computed(() => !!instanceTypeId.value);

// instanceTypeId が変更されたら、CPUとメモリの値を自動設定/リセットする
watch(instanceTypeId, (newId) => {
  if (newId) {
    // テンプレートが選択された
    const selectedType = instanceTypes.value?.find((t) => t.id === newId);
    if (selectedType) {
      // CPUとメモリの値を自動設定
      setFieldValue("cpuCores", selectedType.cpuCore);
      setFieldValue(
        "memorySize",
        Math.round(selectedType.memorySize / (1024 * 1024 * 1024))
      ); // Byte to GiB
    }
  } else {
    // "カスタム" が選択された
    // (注: 親から resetForm された初期値がカスタムスペックだった場合、
    //  その値は保持したいが、VeeValidateの仕様上、一度 null にリセットするのが無難)
    setFieldValue("cpuCores", null);
    setFieldValue("memorySize", null);
  }
});

// ==============================================================================
// UI操作 (ストレージ追加/削除)
// ==============================================================================
const addStorage = () => {
  pushStorage({
    id: null, // ★ 新規ストレージにはIDはない (APIが採番する)
    name: "new-storage",
    size: 10, // デフォルトサイズ
    poolId: undefined, // 未選択状態
    type: "manual", // OSディスク以外は 'manual'
  });
};

// ==============================================================================
// Expose (親へのインターフェース公開)
// ==============================================================================
defineExpose({
  validate, // バリデーション実行関数
  resetForm, // フォーム初期化関数
  values, // フォームの現在の値 (ref)
  meta, // フォームのバリデーション状態 (ref)
});
</script>

<style scoped>
/* 共通スタイルシート (tailwind.css) で定義されているクラスを使用します。
  VmEditTabConfig.vue 固有のスタイルが必要な場合のみ、ここに記述します。
*/
</style>
