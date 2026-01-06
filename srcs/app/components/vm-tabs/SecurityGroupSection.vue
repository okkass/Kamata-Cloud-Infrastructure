<template>
  <section>
    <h3 class="text-lg font-medium text-gray-900 mb-4">セキュリティグループ</h3>

    <div v-if="error" class="text-sm text-red-500 mb-2">
      セキュリティグループ情報の取得に失敗しました。
    </div>

    <div class="flex gap-2 mb-4">
      <FormSelect
        name="sg-select"
        v-model="selectedSgId"
        :options="availableOptions"
        placeholder="セキュリティグループを追加..."
        class="flex-1"
      />
      <button
        type="button"
        @click="addSecurityGroup"
        :disabled="!selectedSgId"
        class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        追加
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <div
        v-for="(sg, index) in modelValue"
        :key="sg.id"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
      >
        {{ sg.name }}
        <button
          type="button"
          @click="removeSecurityGroup(index)"
          class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-800 transition-colors"
        >
          <span class="sr-only">削除</span>
          <svg
            class="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div v-if="modelValue.length === 0" class="text-sm text-gray-400 py-1">
        割り当てなし
      </div>
    </div>
    <div v-if="errorMessage" class="text-sm text-red-500 mt-1">
      {{ errorMessage }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import FormSelect from "~/components/Form/Select.vue";

interface SecurityGroupItem {
  id: string;
  name: string;
}

const props = defineProps<{
  modelValue: SecurityGroupItem[];
  masterSecurityGroups: SecurityGroupResponse[];
  error?: any;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  add: [value: SecurityGroupItem];
  remove: [index: number];
}>();

const selectedSgId = ref<string>("");

// 追加可能なセキュリティグループリスト（既に割り当て済みのものは除外）
const availableOptions = computed(() => {
  const currentIds = new Set(props.modelValue.map((sg) => sg.id));
  return (props.masterSecurityGroups || [])
    .filter((sg) => !currentIds.has(sg.id))
    .map((sg) => ({
      id: sg.id,
      name: sg.name,
    }));
});

/**
 * セキュリティグループを追加
 */
const addSecurityGroup = () => {
  if (!selectedSgId.value) return;

  const sgToAdd = props.masterSecurityGroups?.find(
    (sg) => sg.id === selectedSgId.value
  );

  if (sgToAdd) {
    emit("add", {
      id: sgToAdd.id,
      name: sgToAdd.name,
    });
    selectedSgId.value = ""; // リセット
  }
};

/**
 * セキュリティグループを削除
 */
const removeSecurityGroup = (index: number) => {
  emit("remove", index);
};
</script>
