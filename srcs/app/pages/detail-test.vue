<template>
  <main class="mx-auto max-w-6xl px-4 py-6">
    <!-- ヘッダ -->
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Chiffon-OCI-ARM01</h1>
        <p class="text-sm text-neutral-500">インスタンスの詳細</p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          アクション
        </button>
        <button
          class="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          起動
        </button>
      </div>
    </header>

    <!-- タブバー -->
    <UITabs v-model="active" :tabs="tabs" />

    <!-- タブ: 詳細 -->
    <section v-show="active === 'details'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">詳細</h2>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BaseDetail :title="'一般情報'" :items="generalInfo" />
        <BaseDetail :title="'イメージ情報'" :items="imageInfo" />
      </div>
    </section>

    <!-- タブ: ネットワーキング -->
    <section v-show="active === 'network'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">ネットワーキング</h2>
      <BaseDetail :items="networkInfo" />
    </section>

    <!-- タブ: ストレージ -->
    <section v-show="active === 'storage'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">ストレージ</h2>
      <p class="text-sm text-neutral-500">ここにストレージ構成を表示します。</p>
    </section>

    <!-- タブ: セキュリティ -->
    <section v-show="active === 'security'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">セキュリティ</h2>
      <p class="text-sm text-neutral-500">セキュリティ設定を表示します。</p>
    </section>

    <!-- タブ: 管理 -->
    <section v-show="active === 'manage'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">管理</h2>
      <p class="text-sm text-neutral-500">管理系操作を配置します。</p>
    </section>

    <!-- タブ: OS管理 -->
    <section v-show="active === 'os'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">OS管理</h2>
      <p class="text-sm text-neutral-500">OS管理ツールの状態を表示します。</p>
    </section>

    <!-- タブ: モニタリング -->
    <section v-show="active === 'monitor'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">モニタリング</h2>
      <p class="text-sm text-neutral-500">グラフやメトリクスを配置します。</p>
    </section>

    <!-- タブ: 作業リクエスト -->
    <section v-show="active === 'work'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">作業リクエスト</h2>
      <p class="text-sm text-neutral-500">
        操作ログやイベント情報を表示します。
      </p>
    </section>

    <!-- タブ: タグ -->
    <section v-show="active === 'tags'" class="py-6">
      <h2 class="mb-4 text-lg font-semibold">タグ</h2>
      <p class="text-sm text-neutral-500">リソースタグ一覧を表示します。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import UITabs from "@/components/ui/UITabs.vue";
import BaseDetail from "@/components/BaseDetail.vue";

/*
  ✅ ここだけ編集すればタブ名と並びを自由に変えられる
*/
const tabs = [
  { label: "詳細", value: "details" },
  { label: "ネットワーキング", value: "network" },
  { label: "ストレージ", value: "storage" },
  { label: "セキュリティ", value: "security" },
  { label: "管理", value: "manage" },
  { label: "OS管理", value: "os" },
  { label: "モニタリング", value: "monitor" },
  { label: "作業リクエスト", value: "work" },
  { label: "タグ", value: "tags" },
];

const active = ref<string>(
  new URL(window.location.href).searchParams.get("tab") || "details"
);
watch(
  active,
  (v) => {
    const u = new URL(window.location.href);
    u.searchParams.set("tab", v);
    window.history.replaceState({}, "", u.toString());
  },
  { immediate: true }
);

/*
  ✅ ここを編集すればカード中身を自由に変えられる
*/
const generalInfo = [
  { label: "可用性ドメイン", value: "AD-1" },
  { label: "リージョン", value: "ap-osaka-1" },
];

const imageInfo = [
  { label: "OS", value: "Ubuntu 22.04" },
  { label: "イメージID", value: "Canonical-2024-05-31" },
];

const networkInfo = [
  { label: "Public IPv4", value: "203.0.113.42" },
  { label: "Private IPv4", value: "10.0.0.12" },
];
</script>

<style scoped>
main {
  min-height: 70vh;
}
</style>
