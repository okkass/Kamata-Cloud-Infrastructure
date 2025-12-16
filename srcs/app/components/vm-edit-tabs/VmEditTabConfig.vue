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
            :min="1"
            required
            placeholder="例: 2"
            suffix="Core"
          >
            <template #suffix>
              <span class="ml-2 text-gray-500 text-sm">Core</span>
            </template>
          </FormInput>

          <FormInput
            label="メモリサイズ"
            name="memorySize"
            type="number"
            v-model.number="model.memorySize"
            :min="1"
            required
            placeholder="例: 4"
          >
            <template #suffix>
              <span class="ml-2 text-gray-500 text-sm">GB</span>
            </template>
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

        <StorageConfigTable
          :storages="model.storages"
          :storage-pools="storagePools"
          @add="handleAddStorage"
          @remove="handleRemoveStorage"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FormInput from "~/components/Form/Input.vue";
import StorageConfigTable from "~/components/StorageConfigTable.vue"; // アップロードされたファイルを使用

// 親コンポーネント (useResourceUpdater) からのデータをバインド
const model = defineModel<any>({ required: true });

// ストレージプール一覧 (Selectボックス用)
const storagePools = ref<any[]>([]);

/**
 * ストレージプールの取得
 * 実際の実装に合わせてエンドポイントを調整してください
 */
onMounted(async () => {
  try {
    // 例: APIからストレージプール一覧を取得
    // const { data } = await useFetch("/api/storage-pools");
    // storagePools.value = data.value;

    // 仮のモックデータ (動作確認用)
    storagePools.value = [
      { id: "pool-1", name: "Default Pool (SSD)" },
      { id: "pool-2", name: "Archive Pool (HDD)" },
    ];
  } catch (e) {
    console.error("ストレージプールの取得に失敗しました", e);
  }
});

/**
 * ストレージの追加
 * 新しい行を配列に追加します。Bulk APIへの反映は保存時に計算されます。
 */
const handleAddStorage = () => {
  if (!model.value.storages) {
    model.value.storages = [];
  }

  // 新規ストレージの初期値
  model.value.storages.push({
    // IDは新規作成時は空か、あるいはフロントエンドで一時IDを振るなど、
    // useResourceUpdaterの仕様（newIdPrefixなど）に合わせて調整してください
    id: `new-${Date.now()}`,
    name: `disk-${model.value.storages.length + 1}`,
    size: 20, // デフォルト20GB
    poolId: storagePools.value[0]?.id || "",
    type: "data", // 必要であれば
  });
};

/**
 * ストレージの削除
 * 配列から要素を取り除きます。
 */
const handleRemoveStorage = (index: number) => {
  model.value.storages.splice(index, 1);
};
</script>
