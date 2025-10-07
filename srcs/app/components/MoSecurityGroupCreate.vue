<template>
  <BaseModal :show="show" @close="$emit('close')">
    <div class="p-4">
      <div class="flex space-y-4 flex-col">
        <h2 class="text-xl font-bold">セキュリティグループ作成</h2>
        <!-- フォーム内容はここに追加 -->
        <button
          @click="createSG"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          作成
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const createSG = async () => {
  // セキュリティグループ作成ロジックをここに実装
  useToast().addToast({ type: "success", message: "セキュリティグループが作成されました" });
  emit("success");
};
</script>
