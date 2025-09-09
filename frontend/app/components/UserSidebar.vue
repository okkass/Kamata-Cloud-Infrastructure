<script setup>
// Vueのリアクティブ（変更を自動で画面に反映する）機能を使うためにrefをインポートします。
import { ref } from "vue";

// --- データ定義 ---
// refで囲むことで、このデータが変更された際にVueが自動的に画面を更新するようになります。
// サイドバーに表示するメニューの構造を、オブジェクトの配列として定義しています。
// この配列を書き換えるだけで、サイドバーの見た目を自由に変更できます。
const sidebarSections = ref([
  {
    title: "利用者ダッシュボード",
    links: [{ text: "利用者ダッシュボード", href: "#" }],
  },
  {
    title: "仮想ネットワーク管理",
    links: [{ text: "仮想ネットワークダッシュボード", href: "#" }],
  },
  {
    title: "セキュリティグループ管理",
    links: [{ text: "セキュリティグループダッシュボード", href: "#" }],
  },
  {
    title: "仮想マシン管理",
    links: [
      { text: "仮想マシンダッシュボード", href: "#" },
      { text: "ポートフォリオ公開環境管理", href: "#" },
      { text: "スナップショット管理", href: "#" },
      { text: "バックアップ・復元管理", href: "#" },
    ],
  },
]);

// --- 状態管理 ---
// 開いているセクションのタイトルを複数保持するための配列です。
// 初期値は空の配列なので、最初はすべてのセクションが閉じた状態になります。
// 例: ref(['仮想マシン管理']) とすると、初期状態で仮想マシン管理が開きます。
const openSections = ref([]);

// --- メソッド（関数） ---
// セクションのタイトル部分がクリックされたときに呼び出される関数です。
function toggleSection(title) {
  // openSections配列の中に、クリックされたセクションのタイトルが存在するかどうかを探します。
  const index = openSections.value.indexOf(title);

  if (index === -1) {
    // indexが-1の場合、タイトルは配列内に存在しないことを意味します。
    // そのため、配列にタイトルを追加してセクションを開きます。
    openSections.value.push(title);
  } else {
    // タイトルが配列内に存在する場合、その要素を配列から削除してセクションを閉じます。
    openSections.value.splice(index, 1);
  }
}

// テンプレート内でセクションが開いているかどうかを判定するためのヘルパー関数です。
// これを使うことで、テンプレート内のv-ifの記述がスッキリします。
function isSectionOpen(title) {
  // openSections配列に指定されたタイトルが含まれているかを true / false で返します。
  return openSections.value.includes(title);
}
</script>

<template>
  <div
    class="fixed top-0 left-0 bottom-0 w-64 bg-slate-800 text-white p-5 overflow-y-auto"
  >
    <div class="text-lg font-bold bg-slate-900 p-3 rounded-md mb-6">
      利用者メニュー
    </div>

    <div
      v-for="section in sidebarSections"
      :key="section.title"
      class="mb-2 border-b border-slate-700 last:border-b-0"
    >
      <div
        @click="toggleSection(section.title)"
        class="flex justify-between items-center p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors"
      >
        <span class="font-semibold text-sm">{{ section.title }}</span>

        <span
          class="transform transition-transform duration-300"
          :class="{ 'rotate-180': isSectionOpen(section.title) }"
          >▼</span
        >
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div v-if="isSectionOpen(section.title)" class="mt-2 mb-3 space-y-1">
          <a
            v-for="link in section.links"
            :key="link.text"
            :href="link.href"
            class="block text-sm pl-6 py-2 rounded-md hover:bg-slate-700 transition-colors"
          >
            {{ link.text }}
          </a>
        </div>
      </Transition>
    </div>
  </div>
</template>