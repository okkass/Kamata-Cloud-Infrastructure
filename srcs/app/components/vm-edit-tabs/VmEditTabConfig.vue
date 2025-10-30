<template>
  <div class="space-y-6">
    <div class="p-4 border border-gray-200 rounded-lg space-y-4">
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

    <div class="form-section">
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
            <option :value="null" disabled>選択してください</option>
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
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ==============================================================================
// 型定義
// ==============================================================================
interface ModelStoragePoolDTO {
  id: string;
  name: string;
}

// ==============================================================================
// バリデーション
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    cpuCores: z
      .number({ invalid_type_error: "CPUコア数は必須です。" })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    memorySize: z
      .number({ invalid_type_error: "メモリは必須です。" })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    storages: z
      .array(
        z.object({
          name: z.string().min(1, "名前は必須です。"),
          size: z
            .number({ invalid_type_error: "サイズは必須です。" })
            .int("整数で入力してください。")
            .min(1, "1以上の値を入力してください。"),
          poolId: z.string({ required_error: "プールを選択してください。" }),
          type: z.string(), // typeはバリデーション対象外
        })
      )
      .min(1, "OSディスクは必須です。"),
  })
);

const { errors, defineField, values, meta, resetForm } = useForm({
  validationSchema,
});

const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySize, memorySizeAttrs] = defineField("memorySize");
const {
  fields: storageFields,
  push: pushStorage,
  remove: removeStorage,
} = useFieldArray<any>("storages");

// --- 親コンポーネントへの公開 ---
defineExpose({
  formData: values,
  isValid: meta,
  resetForm,
});

// ==============================================================================
// API連携
// ==============================================================================
const {
  data: storagePools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<ModelStoragePoolDTO>("storage-pools");

// ==============================================================================
// UI操作
// ==============================================================================
let nextStorageId = ref(100); // 初期IDがかぶらないように大きな値から始める
const addStorage = () => {
  pushStorage({
    id: `new-${nextStorageId.value++}`,
    name: "",
    size: 10,
    poolId: null,
    type: "manual",
  });
};
</script>

<style scoped>
/* (スタイルは作成モーダルと同じ) */
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
</style>
