<template>
  <div class="border rounded-md overflow-hidden bg-white">
    <div
      class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
    >
      <h3 class="font-bold text-sm text-gray-700">ディスク一覧</h3>
      <button
        type="button"
        @click="$emit('add')"
        class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"
      >
        + 追加
      </button>
    </div>

    <div class="p-4">
      <div
        v-if="storages.length === 0"
        class="text-center text-gray-400 py-4 text-sm"
      >
        ストレージがありません。
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(storage, index) in storages"
          :key="storage.id || index"
          class="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
        >
          <div class="grid grid-cols-12 gap-3 items-start">
            <div class="col-span-4">
              <FormInput
                label="名前"
                :name="`storage-name-${index}`"
                v-model="storage.name"
                :error="errors?.[index]?.name"
                placeholder="disk-1"
                class="w-full"
              />
            </div>

            <div class="col-span-3">
              <FormInput
                label="サイズ (GB)"
                :name="`storage-size-${index}`"
                type="number"
                v-model.number="storage.size"
                :error="errors?.[index]?.size"
                :disabled="storage.type === 'backup' || !isNewStorage(storage)"
                :title="
                  storage.type === 'backup'
                    ? 'バックアップ元のサイズに固定されています'
                    : !isNewStorage(storage)
                    ? '既存ディスクのサイズは変更できません'
                    : ''
                "
                class="w-full"
              />
            </div>

            <div class="col-span-4">
              <FormSelect
                label="保存先プール"
                :name="`storage-pool-${index}`"
                v-model="storage.poolId"
                :options="storagePools"
                :errorMessage="errors?.[index]?.poolId"
                placeholder="プールを選択"
                class="w-full"
                :disabled="!isNewStorage(storage)"
                :title="
                  !isNewStorage(storage)
                    ? '既存ディスクの保存先プールは変更できません'
                    : ''
                "
              />
            </div>

            <div class="col-span-1 flex justify-end mt-7">
              <button
                type="button"
                @click="$emit('remove', index)"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
// 共通コンポーネントのインポート
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";

// 型定義は環境に合わせて適宜調整してください
// import type { StoragePoolResponse } from "~~/shared/types";

const props = defineProps<{
  storages: any[];
  storagePools: any[];
  errors?: Record<number, { name?: string; size?: string; poolId?: string }>;
}>();

defineEmits(["add", "remove"]);

const isNewStorage = (storage: any) => {
  return typeof storage.id === "string" && storage.id.startsWith("new-");
};
</script>
