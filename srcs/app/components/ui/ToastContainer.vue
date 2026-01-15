<template>
  <!-- トースト通知用のコンテナ 画面右上に固定表示 -->
  <div class="fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
    <!-- 出現、消滅などのアニメーションを適用 -->
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
        class="relative flex w-full flex-col rounded-lg p-4 text-white shadow-lg overflow-hidden"
        :class="toastStyles[toast.type]"
      >
        <!-- アイコン表示エリア -->
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 pt-0.5">
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

        <!-- プログレスバー表示エリア -->
        <div v-if="typeof toast.progress === 'number'" class="mt-3 w-full">
          <div class="mb-1 flex justify-end text-xs font-semibold opacity-90">
            {{ toast.progress }}%
          </div>
          <div class="h-2 w-full rounded-full bg-black/20">
            <div
              class="h-full rounded-full bg-white transition-all duration-300 ease-out"
              :style="{ width: `${clampPercent(toast.progress)}%` }"
            ></div>
          </div>
        </div>
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

/* パーセント値を安全に0-100の範囲に制限 */
function clampPercent(value: number | undefined | null): number {
  if (value == null || isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
</script>
