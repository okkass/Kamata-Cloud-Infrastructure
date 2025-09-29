<template>
  <div class="space-y-4">
    <div>
      <label for="os-image-select" class="form-label">OSイメージ</label>
      <select
        id="os-image-select"
        v-model="formData.osImageId"
        class="form-input"
      >
        <option :value="null" disabled>OSイメージを選択してください</option>
        <option v-for="image in osImages" :key="image.id" :value="image.id">
          {{ image.name }}
        </option>
      </select>
    </div>

    <div>
      <label for="middleware-select" class="form-label">ミドルウェア選択</label>
      <select
        id="middleware-select"
        v-model="formData.middlewareId"
        class="form-input"
      >
        <option :value="null">なし</option>
        <option v-for="mw in middlewares" :key="mw.id" :value="mw.id">
          {{ mw.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// このコンポーネントは、OSとミドルウェアを選択するためのフォームです。
// APIから「OSイメージ一覧」「ミドルウェア一覧」を取得し、
// `osImages`, `middlewares` のrefを更新する処理を実装してください。
// ==============================================================================

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const formData = ref({
  osImageId: null,
  middlewareId: null,
});

// --- 親コンポーネントがこのタブのデータにアクセスできるように公開 ---
defineExpose({
  formData,
});

// ============================================================================
// ▼▼▼ API実装担当者の方へ: ここにAPIから各種リストを取得する処理を実装してください ▼▼▼
// ============================================================================

// --- APIから取得するデータ（現在はダミー） ---
const osImages = ref([
  { id: "img-ubuntu-2204", name: "Ubuntu 22.04" },
  { id: "img-ubuntu-2004", name: "Ubuntu 20.04" },
  { id: "img-centos-9", name: "CentOS Stream 9" },
  { id: "img-alma-9", name: "AlmaLinux 9" },
]);

const middlewares = ref([
  { id: "mw-lamp", name: "LAMP (Apache, MySQL, PHP)" },
  { id: "mw-nginx", name: "Nginx" },
  { id: "mw-docker", name: "Docker" },
]);

// onMounted(async () => {
//   // ページが読み込まれたら、APIからデータを取得
//   const { data: imagesData } = await useApiFetch('/os-images');
//   osImages.value = imagesData.value;
//
//   const { data: mwData } = await useApiFetch('/middlewares');
//   middlewares.value = mwData.value;
// });

// ============================================================================
// ▲▲▲ API実装はここまで ▲▲▲
// ============================================================================
</script>

<style scoped>
/* ラベルの共通スタイル */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
/* 入力欄（input, select）の共通スタイル */
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
</style>
