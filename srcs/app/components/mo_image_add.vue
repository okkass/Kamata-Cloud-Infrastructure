<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <section
      class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 md:p-8"
    >
      <!-- header -->
      <header class="mb-6">
        <h2
          class="text-2xl md:text-[26px] font-extrabold tracking-tight text-slate-900"
        >
          {{ title }}
        </h2>
      </header>

      <!-- body -->
      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- image name -->
        <div>
          <label
            for="imageName"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            イメージ名 <span class="text-rose-600">*</span>
          </label>
          <input
            id="imageName"
            v-model.trim="imageName"
            type="text"
            required
            class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
            placeholder="例）ubuntu-24.04-amd64"
          />
        </div>

        <!-- file dropzone -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            イメージファイル <span class="text-rose-600">*</span>
          </label>

          <div
            class="group relative flex min-h-[140px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 transition"
            :class="{
              'border-sky-500 bg-sky-50/60 shadow-inner': dragOver,
              'hover:border-slate-400 hover:bg-slate-50': !dragOver,
            }"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
            @click="fileInput?.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".img,.qcow2,.raw,.iso,.vhd,.vhdx,.vmdk,.zip,.gz,.xz"
              class="sr-only"
              @change="onFilePick"
              required
            />
            <div class="text-center">
              <!-- upload icon -->
              <svg
                class="mx-auto mb-3 h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 16V4m0 0l-4 4m4-4l4 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
              <p class="text-sm text-slate-700">
                ここに<strong class="font-semibold">ドラッグ＆ドロップ</strong
                >するか、クリックして選択
              </p>
              <p class="mt-1 text-xs text-slate-500">
                対応：img / qcow2 / raw / iso / vhd(x) / vmdk / zip / gz / xz
              </p>
              <p v-if="file" class="mt-2 text-sm font-medium text-slate-800">
                選択中：{{ file.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            @click="$emit('close')"
          >
            キャンセル
          </button>

          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white shadow-lg transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
            :style="{ backgroundColor: buttonColor }"
          >
            <svg
              v-if="submitting"
              class="mr-2 h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            追加
          </button>
        </div>

        <transition name="fade">
          <p v-if="message" class="mt-3 text-sm text-slate-700">
            {{ message }}
          </p>
        </transition>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: "イメージ追加" },
  buttonColor: { type: String, default: "#1a73e8" },
});
const emit = defineEmits(["close", "submitted"]);

const fileInput = ref(null);
const dragOver = ref(false);
const submitting = ref(false);
const message = ref("");

const imageName = ref("");
const file = ref(null);

function onFilePick(e) {
  const f = e.target.files?.[0];
  if (f) file.value = f;
}
function onDrop(e) {
  dragOver.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) file.value = f;
}
async function onSubmit() {
  if (!imageName.value || !file.value) return;
  submitting.value = true;
  message.value = "";
  try {
    await new Promise((r) => setTimeout(r, 600));

    // 現在時刻を整形して追加
    const now = new Date();
    const formatted = now.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    message.value = `「${imageName.value}」を追加しました（${file.value.name}） - ${formatted}`;

    emit("submitted", {
      name: imageName.value,
      file: file.value,
      addedAt: now,
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
