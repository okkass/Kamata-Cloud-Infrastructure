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

      <div class="storage-list space-y-4">
        <div
          v-for="(storage, index) in storageFields"
          :key="storage.key"
          class="storage-item grid grid-cols-12 gap-3 items-start"
        >
          <div class="col-span-12" v-if="storage.value.type === 'os'">
            <label class="form-label-sm">OSディスク</label>
            <input
              type="text"
              class="form-input"
              :value="`${storage.value.name} (${storage.value.size} GB)`"
              disabled
            />
          </div>
          <template v-else>
            <div class="col-span-4">
              <label :for="`storage-name-${index}`" class="form-label-sm">
                名前
              </label>
              <input
                type="text"
                :id="`storage-name-${index}`"
                v-model="storage.value.name"
                class="form-input"
                :class="{
                  'form-border-error': errors[`storages[${index}].name`],
                }"
                placeholder="data-disk"
              />
            </div>
            <div class="col-span-3">
              <label :for="`storage-size-${index}`" class="form-label-sm">
                サイズ(GB)
              </label>
              <input
                type="number"
                :id="`storage-size-${index}`"
                v-model.number="storage.value.size"
                class="form-input"
                :class="{
                  'form-border-error': errors[`storages[${index}].size`],
                }"
                min="1"
              />
            </div>
            <div class="col-span-4">
              <FormSelect
                label="ストレージプール"
                :label-hidden="true"
                :name="`storage-pool-${index}`"
                v-model="storage.value.poolId"
                :options="pools ?? []"
                option-value="id"
                option-label="name"
                placeholder="プールを選択"
                :pending="poolsPending"
                :error="poolsError"
                :error-message="errors[`storages[${index}].poolId`]"
                :required="true"
                :placeholder-value="undefined"
              />
            </div>
            <div class="col-span-1 pt-9">
              <button
                type="button"
                @click="removeStorage(index)"
                class="text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </div>
          </template>
        </div>
      </div>

      <button
        type="button"
        @click="addStorage"
        class="btn-secondary-outline mt-4"
      >
        ストレージを追加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * VM編集モーダル: 構成タブ (VmEditTabConfig.vue)
 * ---------------------------------------------------------------------------------
 * ★ ローカルストレージプールのみを取得するように修正
 * =================================================================================
 */
// import { computed } from 'vue'; // (computed は不要になったため削除)
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useResourceList } from "~/composables/useResourceList";

/**
 * 'storage-pools' ファイルから 'LocalStoragePoolDTO' のみをインポート
 */
import type { LocalStoragePoolDTO } from "~~/shared/types/storage-pools";

// =============================================================================
// Props (初期値受け取り)
// =============================================================================
// (変更なし)
const props = defineProps<{
  initialData: {
    instanceTypeId: string | null;
    cpuCores: number;
    memorySize: number;
    storages: {
      id: string;
      name: string;
      size: number;
      poolId: string;
      type: "os" | "manual";
      createdAt: string;
    }[];
  };
}>();

// =============================================================================
// Data Fetching (ストレージプール一覧)
// =============================================================================
// ★ 修正: ローカルストレージプールのみを取得

// (ネットワークプールの useResourceList 呼び出しは削除)

// ★ 修正: APIパスをご指定の 'storage-pools/local' に修正
// ★ 修正: 変数名を 'pools', 'poolsPending', 'poolsError' に変更
const {
  data: pools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<LocalStoragePoolDTO>("storage-pools/local");

// (allPools, poolsPending, poolsError の computed は削除)

// =============================================================================
// Validation Schema (バリデーション定義)
// =============================================================================
// (変更なし)
const storageSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  type: z.enum(["os", "manual"]),
  name: z.string().min(1, "ストレージ名は必須です。"),
  size: z.number().min(1, "サイズは1GB以上である必要があります。"),
  poolId: z.string({ message: "ストレージプールを選択してください。" }),
});

const validationSchema = toTypedSchema(
  z.object({
    instanceTypeId: z.string().nullable(),
    cpuCores: z.number().min(1, "CPUは1コア以上である必要があります。"),
    memorySize: z.number().min(1, "メモリは1GB以上である必要があります。"),
    storages: z
      .array(storageSchema)
      .min(1, "OSディスクを含むストレージが最低1つ必要です。"),
  })
);

// =============================================================================
// Form Setup (VeeValidate)
// =============================================================================
// (変更なし)
const { errors, defineField, values, meta, validate } = useForm({
  validationSchema,
  initialValues: {
    instanceTypeId: props.initialData.instanceTypeId,
    cpuCores: props.initialData.cpuCores,
    memorySize: props.initialData.memorySize,
    storages: props.initialData.storages,
  },
});

// (v-model ヘルパーは変更なし)
const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySize, memorySizeAttrs] = defineField("memorySize");

// (FieldArray の設定は変更なし)
const {
  fields: storageFields,
  remove: removeStorage,
  push: pushStorage,
} = useFieldArray<VirtualStorageDTO>("storages");

// (addStorage ロジックは変更なし)
const addStorage = () => {
  pushStorage({
    id: `new-${crypto.randomUUID()}`,
    createdAt: new Date(),
    name: "new-storage",
    size: 10,
    poolId: undefined as any,
  });
};

// =============================================================================
// Expose (親へのインターフェース公開)
// =============================================================================
// (変更なし)
defineExpose({
  validate,
  values,
  meta,
});
</script>

<style scoped>
/* (スタイルは変更なし) */
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
.btn-secondary-outline {
  @apply py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50;
}
</style>
