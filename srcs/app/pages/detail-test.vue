<template>
  <ResourceDetailShell
    title="サーバー詳細"
    subtitle="基本情報"
    :tabs="tabs"
    :actions="actions"
    :context="context"
    @back="onBack"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { Component } from "vue";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";

// ==== ここが「ページごとにカスタマイズする部分」 ====

// 1. タブの定義（このページ専用）
type TabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

const tabs: TabConfig[] = [
  {
    label: "詳細",
    value: "details",
    loader: () => import("~/components/detail/panels/DetailTabGeneral.vue"),
  },
  {
    label: "ネットワーキング",
    value: "network",
    loader: () => import("~/components/detail/panels/DetailTabNetwork.vue"),
  },
  {
    label: "ストレージ",
    value: "storage",
    loader: () => import("~/components/detail/panels/DetailTabStorage.vue"),
  },
  // このページ固有で増やすならここに追加
];

// 2. プルダウンメニューの中身（このページ専用）
const actions = [
  { label: "再起動", value: "reboot" },
  { label: "停止", value: "stop" },
  { label: "削除", value: "delete" },
];

// 3. 全タブ共通で使いたいコンテキスト
const context = {
  id: "srv-001",
  region: "ap-osaka-1",
  createdAt: "2025-11-26T09:00:00Z",
};

// 4. イベントハンドラ
const onBack = () => {
  // ここで URL 遷移したり、$router.back() したり
  // 例: useRouter() して router.back()
  console.log("戻るが押された");
};

const onAction = (action: { label: string; value: string }) => {
  console.log("操作メニュー:", action);
  // value に応じて処理分岐すればOK
};
</script>
