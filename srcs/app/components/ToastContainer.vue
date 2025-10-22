<template>
  <!-- トーストコンテナ: 画面の右上に固定表示 -->
  <div class="fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
    <!-- TransitionGroup: トーストの出現・消滅時にアニメーションを適用 -->
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-full"
      leave-active-class="transition-all duration-300 ease-in"
      leave-to-class="opacity-0 translate-x-full"
    >
      <!-- v-for: toasts配列をループして各トーストを描画 -->
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex w-full items-start gap-3 rounded-lg p-4 text-white shadow-lg"
        :class="toastStyles[toast.type]"
      >
        <!-- アイコン表示エリア -->
        <div class="flex-shrink-0">
          <component :is="toastIcons[toast.type]" class="h-6 w-6" />
        </div>

        <!-- メッセージ表示エリア -->
        <div class="flex-1 break-words">
          <p class="font-bold">{{ toast.message }}</p>
          <p
            v-if="toast.details"
            class="mt-1 border-t border-white/30 pt-1 text-sm opacity-90"
          >
            {{ toast.details }}
          </p>
        </div>

        <!-- 閉じるボタン -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 rounded-full p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="閉じる"
        >
          <svg
            class="h-5 w-5"
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
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast();

// トーストのタイプに応じたTailwindのクラスを定義
const toastStyles = {
  info: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

// タイプに応じたアイコンのSVGを定義
const toastIcons = {
  info: resolveComponent("IconInfo"),
  success: resolveComponent("IconSuccess"),
  warning: resolveComponent("IconWarning"),
  error: resolveComponent("IconError"),
};
</script>
