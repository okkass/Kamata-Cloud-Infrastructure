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
          class="form-input"
        />
      </div>
      <div>
        <label for="memory-mb" class="form-label-sm">メモリ (MB)</label>
        <input
          type="number"
          id="memory-mb"
          v-model="memoryMb"
          class="form-input"
        />
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-4">ストレージ設定</h3>

      <table class="w-full">
        <thead class="text-xs text-gray-600 text-left">
          <tr>
            <th class="pb-2 w-4">No.</th>
            <th class="pb-2 w-14 text-left">名前</th>
            <th class="pb-2 w-8 text-left">サイズ (GB)</th>
            <th class="pb-2 w-10">ストレージプール</th>
            <th class="pb-2 w-5 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(storage, index) in storageList"
            :key="storage.id"
            class="border-t border-gray-200"
          >
            <td class="py-2 text-center text-gray-600 font-medium align-middle">
              {{ index + 1 }}.
            </td>
            <td class="py-2 align-middle">
              <input
                type="text"
                v-model="storage.name"
                :placeholder="storage.type === 'os' ? 'OS' : '例: web-data'"
                :disabled="storage.type === 'os'"
                class="form-input"
              />
            </td>
            <td class="py-2 align-middle">
              <input
                type="number"
                v-model="storage.size"
                :disabled="storage.type === 'os'"
                class="form-input"
              />
            </td>
            <td class="py-2 align-middle">
              <select v-model="storage.pool" class="form-input">
                <option>Pool-1</option>
                <option>Pool-2</option>
              </select>
            </td>
            <td class="py-2 text-center align-middle">
              <div v-if="storage.type !== 'os'" class="flex justify-center">
                <SecondaryButton
                  @click="deleteStorage(storage.id)"
                  class="w-5 h-5 !p-0 flex items-center justify-center !rounded-full"
                >
                  &times;
                </SecondaryButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-end mt-4">
        <button @click="addStorage" class="btn-secondary">追加</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SecondaryButton from "~/components/SecondaryButton.vue";

const props = defineProps({
  configData: {
    type: Object,
    required: true,
    default: () => ({
      cpu: 4,
      memory: 4096,
      storage: [{ id: 1, name: "OS", size: 50, pool: "Pool-2", type: "os" }],
    }),
  },
});
const cpuCores = ref(props.configData.cpu);
const memoryMb = ref(props.configData.memory);
const storageList = ref(JSON.parse(JSON.stringify(props.configData.storage)));
let nextStorageId = ref(storageList.value.length + 1);
const addStorage = () => {
  storageList.value.push({
    id: nextStorageId.value++,
    name: "",
    size: 10,
    pool: "Pool-1",
    type: "manual",
  });
};
const deleteStorage = (idToDelete) => {
  storageList.value = storageList.value.filter(
    (storage) => storage.id !== idToDelete
  );
};
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
</style>
