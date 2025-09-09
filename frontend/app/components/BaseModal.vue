<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <component :is="contentComponent" @close="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<script setup>
// 親コンポーネントから受け取るデータ (props) を定義
defineProps({
  // モーダルの表示状態
  show: {
    type: Boolean,
    required: true,
  },
  // モーダルのタイトル
  title: {
    type: String,
    default: "モーダル",
  },
  // 表示する「中身」のコンポーネント
  contentComponent: {
    type: Object, // コンポーネントはオブジェクトとして渡される
    required: true,
  },
});

// 親コンポーネントに伝えるイベント (emits) を定義
defineEmits(["close"]);
</script>

<style scoped>
/* スタイルは以前のものと同じ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.modal-title {
  margin: 0;
  font-size: 20px;
}
.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #888;
}
</style>
