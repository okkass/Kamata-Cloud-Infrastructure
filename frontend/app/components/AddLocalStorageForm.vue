<template>
  <div>
    <div class="form-group">
      <label for="node-name">ノード名</label>
      <select id="node-name">
        <option>ノードA</option>
        <option>ノードB</option>
      </select>
    </div>
    <div class="form-group">
      <label for="disk-name">ディスク名</label>
      <input type="text" id="disk-name" placeholder="例: Disk01" />
    </div>
    <div class="form-group">
      <label for="recognized-disk">認識ディスク</label>
      <select id="recognized-disk">
        <option>/dev/sda</option>
        <option>/dev/sdb</option>
      </select>
    </div>

    <div class="form-actions">
      <button class="btn-primary" @click="addStorage">追加</button>
    </div>
  </div>
</template>

<script setup>
// このコンポーネントが親に通知するイベントを定義
const emit = defineEmits(["close"]);

// 「追加」ボタンが押されたときの処理
const addStorage = () => {
  alert("「追加」ボタンがクリックされました！");
  // 実際の追加処理...

  // 処理が終わったら、親にモーダルを閉じるよう通知する
  emit("close");
};
</script>

<style scoped>
/* このフォームにだけ適用されるスタイル */
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
