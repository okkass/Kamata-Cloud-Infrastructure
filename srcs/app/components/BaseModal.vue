<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]"
    >
      <div
        class="flex-shrink-0 flex justify-between items-center border-b border-gray-200 pb-4 mb-4"
      >
        <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
        <button
          @click="$emit('close')"
          class="text-3xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
      </div>

      <div class="modal-body overflow-y-auto" :class="modalBodyClass">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: "モーダル" },
  // ★★★ 1. `size` propを追加 (デフォルトは 'md') ★★★
  size: { type: String, default: "md" },
});
defineEmits(["close"]);

// ★★★ 2. `size` propに応じてCSSクラスを返すcomputedプロパティを追加 ★★★
const modalBodyClass = computed(() => {
  switch (props.size) {
    case "lg":
      return "h-[450px]"; // Lサイズの場合の高さ
    case "md":
      return "h-[300px]"; // Mサイズの場合の高さ
    // 必要に応じて 'sm' や 'xl' などを追加
    default:
      return ""; // size指定がない場合は成り行き
  }
});
</script>
