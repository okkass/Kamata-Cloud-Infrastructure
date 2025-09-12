<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">モーダル表示テスト</h1>

    <button
      @click="openModal"
      class="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
    >
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
import BaseModal from "~/components/BaseModal.vue";
import AddLocalStorageForm from "~/components/mo_local_storage_add.vue";

// モーダルの表示/非表示を管理
const isModalVisible = ref(false);
// モーダルのタイトルを管理
const modalTitle = ref("");
// モーダルの「中身」コンポーネントを管理
const modalContent = shallowRef(null);

// モーダルを開く処理
const openModal = () => {
  modalTitle.value = "ローカルストレージ追加";
  modalContent.value = AddLocalStorageForm;
  isModalVisible.value = true;
};

// モーダルを閉じる処理
const closeModal = () => {
  isModalVisible.value = false;
};
</script>
