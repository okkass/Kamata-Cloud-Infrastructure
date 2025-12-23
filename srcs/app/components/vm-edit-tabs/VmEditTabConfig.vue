<template>
  <div class="p-6 h-full overflow-y-auto">
    <div class="max-w-4xl space-y-8">
      <section>
        <h3
          class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
            />
          </svg>
          コンピュート設定
        </h3>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100"
        >
          <FormInput
            label="CPUコア数"
            name="cpuCore"
            type="number"
            v-model.number="model.cpuCore"
            :error="errors?.cpuCore"
            :min="1"
            required
            placeholder="例: 2"
          >
            <template #suffix
              ><span class="ml-2 text-gray-500 text-sm">Core</span></template
            >
          </FormInput>

          <FormInput
            label="メモリサイズ"
            name="memorySize"
            type="number"
            v-model.number="model.memorySize"
            :error="errors?.memorySize"
            :min="1"
            required
            placeholder="例: 4"
          >
            <template #suffix
              ><span class="ml-2 text-gray-500 text-sm">GB</span></template
            >
          </FormInput>
        </div>
      </section>

      <hr class="border-gray-200" />

      <section>
        <h3
          class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
          </svg>
          ストレージ構成
        </h3>

        <div v-if="pending" class="text-sm text-gray-500 mb-2">
          ストレージプール情報を取得中...
        </div>

        <StorageConfigTable
          :storages="model.storages"
          :storage-pools="storagePools"
          :errors="errors?.storages"
          @add="handleAddStorage"
          @remove="handleRemoveStorage"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import FormInput from "~/components/Form/Input.vue";
import StorageConfigTable from "~/components/StorageConfigTable.vue";
import { useResourceList } from "~/composables/useResourceList";

// 親コンポーネントからのデータ
const model = defineModel<any>({ required: true });
defineProps<{
  errors?: {
    cpuCore?: string;
    memorySize?: string;
    storages?: Record<
      number,
      { name?: string; size?: string; poolId?: string }
    >;
  };
}>();

// ★ useResourceList を活用 (型は適宜 interface StoragePoolResponse 等に置き換えてください)
const { data: poolData, pending } =
  useResourceList<StoragePoolResponse>("storage-pools");

// useResourceList は T[] を返すので、そのまま computed で参照可能
const storagePools = computed(() => poolData.value || []);

/**
 * ストレージ追加
 */
const handleAddStorage = () => {
  if (!model.value.storages) {
    model.value.storages = [];
  }

  // 取得したプールリストの先頭をデフォルト値にする
  const defaultPoolId = storagePools.value[0]?.id ?? "";

  model.value.storages.push({
    // 一時ID ("new-")
    id: `new-${Date.now()}`,
    name: `disk-${model.value.storages.length + 1}`,
    size: 20,
    poolId: defaultPoolId,
    type: "data",
  });
};

/**
 * ストレージ削除
 */
const handleRemoveStorage = (index: number) => {
  model.value.storages.splice(index, 1);
};
</script>
