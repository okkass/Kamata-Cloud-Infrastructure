// composables/detail/usevmtabs.ts

import type { Component } from "vue";

export type VmTabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

// 🔧 VM 詳細用のタブ構成
// loader で panels のコンポーネントを読む
export const vmTabs: VmTabConfig[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import("~/components/detail/panels/VmTabBasic.vue"),
  },
  {
    label: "構成",
    value: "spec",
    loader: () => import("~/components/detail/panels/VmTabSpec.vue"),
  },
  {
    label: "セキュリティグループ",
    value: "security",
    loader: () => import("~/components/detail/panels/VmTabSecurity.vue"),
  },
  {
    label: "ネットワークインターフェース",
    value: "nic",
    loader: () => import("~/components/detail/panels/VmTabNic.vue"),
  },
];

// 将来「component で直 import したい」場合用のコメント
// loader を使わず直接読み込みたい場合 component: VmTabBasic のように指定できます
