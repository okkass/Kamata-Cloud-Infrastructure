<template>
  <div class="page-container">
    <h1>モーダル表示テスト</h1>
    <button class="open-button" @click="openModal">
      ローカルストレージ追加モーダルを開く
    </button>

    <BaseModal
      :show="isModalVisible"
      :title="modalTitle"
      :content-component="modalContent"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef } from "vue";

// --- コンポーネントのインポート ---
// Nuxt3ではcomponentsディレクトリのコンポーネントは自動インポートされるので下記は不要
// import BaseModal from '~/components/BaseModal.vue';
import AddLocalStorageForm from "~/components/AddLocalStorageForm.vue";

// --- リアクティブな状態定義 ---

// モーダルの表示/非表示を管理
const isModalVisible = ref(false);
// モーダルに表示するタイトルを管理
const modalTitle = ref("");
// モーダルに表示する「中身」のコンポーネントを管理
// shallowRefは、コンポーネントのような大きなオブジェクトを格納する際にパフォーマンス上有利
const modalContent = shallowRef(null);

// --- 関数定義 ---

// モーダルを開く処理
const openModal = () => {
  // 表示したいコンポーネントとタイトルをセット
  modalTitle.value = "ローカルストレージ追加";
  modalContent.value = AddLocalStorageForm; // ここで中身を指定

  // モーダルを表示
  isModalVisible.value = true;
};

// モーダルを閉じる処理
const closeModal = () => {
  isModalVisible.value = false;
};
</script>

<style scoped>
.page-container {
  padding: 2rem;
}
.open-button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
